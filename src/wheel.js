import deepmerge from 'deepmerge'

/**
 * Wheel Component
 */
export default class Wheel {
    constructor(el, options = {}) {
        // wheel wrapper
        this.wrapper = el

        // options
        const _default = {
            rows: 5, // The maximal display rows
            height: 200 // The height of the wheel
        }

        this.options = deepmerge(_default, options)

        // data store
        this.store = []

        // touch data
        this.move = false
        // touch data structure
        // startX, startY, deltaY, startTranslateY
        this.touches = {}

        // offset of the translateY
        this.translateY = 0

        // Initialize the wheel
        this._init()
    }

    /**
     * Initilize the wheel
     */
    _init() {
        // set up the transition animation
        this.wrapper.style.transition = 'transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1)'

        // binding the mouse and touch events
        this.wrapper.addEventListener('mousedown', this, false)
        this.wrapper.addEventListener('mousemove', this, false)
        this.wrapper.addEventListener('mouseup', this, false)
        this.wrapper.addEventListener('touchstart', this, false)
        this.wrapper.addEventListener('touchmove', this, false)
        this.wrapper.addEventListener('touchend', this, false)
    }

    /**
     * Event handler
     */
    handleEvent(e) {
        switch(e.type) {
            case 'mousedown':
            case 'touchstart':
                this._start(e)
                break
            case 'mousemove':
            case 'touchmove':
                this._move(e)
                break
            case 'mouseup':
            case 'touchend':
                this._end(e)
                break
        }
    }

    /**
     * The mouse up / touch start handler
     */
    _start(e) {
        e.preventDefault()
        e.stopPropagation()

        this.move = true
        this.touches.startX = e.pageX || e.touches[0].clientX
        this.touches.startY = e.pageY || e.touches[0].clientY
        this.touches.startTranslateY = this.translateY
    }

    /**
     * The mouse move / touch move handler
     */
    _move(e) {
        e.preventDefault()
        e.stopPropagation()

        if (!this.move) return

        const currentY = e.pageY || e.touches[0].clientY
        const deltaY = currentY - this.touches.startY
        this.touches.deltaY = deltaY
        this._setTranslate(this.touches.startTranslateY + deltaY)
    }

    /**
     * The mouse up / touch end handler
     */
    _end(e) {
        e.preventDefault()
        e.stopPropagation()

        this.move = false

        // prevent just a tap
        if (!this.touches.deltaY) {
            // reset the touches data
            this.touches = {}

            return
        }

        // overflow
        const maxTranslateY = this._getMaxTranslateY()
        if (this.translateY > 0) {
            this._setTranslate(0)
        } else if (this.translateY < maxTranslateY) {
            // underflow
            this._setTranslate(maxTranslateY)
        } else {
            // fix the offset
            const perHeight = this.options.height / this.options.rows
            const index = Math.abs(Math.round(this.translateY / perHeight))
            this._setTranslate(-index * perHeight)
        }

        // reset the touches data
        this.touches = {}

        // on change callback
        this.onChange && this.onChange(this.getValue())
    }

    /**
     * Set style of translate Y for the wrapper
     *
     * @param y int Translate Y
     * @return object
     */
    _setTranslate(y) {
        this.wrapper.style.transform = `translateY(${y}px)`
        this.translateY = y
        return this
    }

    /**
     * Get max translateY of the wrapper according to data store
     *
     * @return int
     */
    _getMaxTranslateY() {
        return -(this.store.length - 1) * 40
    }

    /**
     * Set data store to the wheel
     *
     * @param data object
     * @return object
     */
    setStore(data) {
        this.store = data

        // re-render the wheel data item
        this._render()

        // re-calculate the max translate Y
        if (this.translateY < this._getMaxTranslateY()) {
            this.setValue(this.store[this.store.length - 1].value)
        }

        return this
    }

    /**
     * Set the value for the wheel
     *
     * @praram v string
     * @reutrn ojbect
     */
    setValue(v) {
        const perHeight = this.options.height / this.options.rows
        const index = this.store.findIndex(item => item.value == v)

        this._setTranslate(-index * perHeight)

        // on change callback
        this.onChange && this.onChange(this.getValue())

        return this
    }

    /**
     * Get current selected value
     *
     * @return object
     */
    getValue() {
        const perHeight = this.options.height / this.options.rows
        const index = Math.abs(Math.round(this.translateY / perHeight))
        return this.store[index]
    }

    /**
     * Render the items in the store
     *
     * @return void
     */
    _render() {
        // clear first, clean the old data
        while (this.wrapper.firstChild) {
            this.wrapper.removeChild(this.wrapper.firstChild)
        }

        // insert placeholder before the list
        Array(2).fill('').map(p => {
            const li = document.createElement('li')
            li.classList.add('datepicker-wheel-item')
            this.wrapper.appendChild(li)
        })

        this.store.map((item, index) => {
            const li = document.createElement('li')
            li.classList.add('datepicker-wheel-item')
            li.dataset.value = item.value
            li.innerText = item.text
            this.wrapper.appendChild(li)
        })

        // insert placeholder after the list
        Array(2).fill('').map(p => {
            const li = document.createElement('li')
            li.classList.add('datepicker-wheel-item')
            this.wrapper.appendChild(li)
        })
    }
}
