import deepmerge from 'deepmerge'
import Wheel from './wheel'
import utils from './utils'

/**
 * DatePicker Component
 */
export default class DatePicker {
    constructor(options) {
        const _default = {
            minDate: null,
            maxDate: null,
            startDate: null,
            endDate: null,
            type: 'date', // the type of the selector {year, month, date}
            multiple: false,
            locale: {
                clear: 'Clear',
                submit: 'Submit',
                startDate: 'Start Date',
                endDate: 'End Date',
                year: 'Year',
                month: 'Month',
                day: 'Day',
                to: 'To'
            },
            debug: false
        }

        // picker options
        this.options = deepmerge(_default, options)

        // store the DOM of picker elements
        this.el = {}

        // current selected type
        this.type = 'start'

        // store the DOM of wheels
        this.wheels = {}

        // Initialize the picker
        this._init()
    }

    /**
     * Initialize the picker
     *
     * 1) render the mask and picker itself
     * 2) binding the mouse and touch events
     */
    _init() {
        this._renderMask()
        this._renderPicker()
        this._bindEvents()

        // generate years' wheel store
        this.wheels.year.setStore(utils.generateYears(this.options.minDate, this.options.maxDate))

        // default switch to start date selector
        this._switchType('start')
    }

    /**
     * Render mask
     */
    _renderMask() {
        const mask = document.createElement('div')
        mask.classList.add('datepicker-mask')
        this.el.mask = mask
        document.body.appendChild(mask)
    }

    /**
     * Render picker
     */
    _renderPicker() {
        const startDate = utils.dateFormat(this.options.startDate)
        const endDate = utils.dateFormat(this.options.endDate)

        const markup = `
            <div class="datepicker-header">
                <div id="datepicker-clear" class="datepicker-clear">${this.options.locale.clear}</div>
                <div id="datepicker-submit" class="datepicker-submit">${this.options.locale.submit}</div>
            </div>
            <div id="datepicker-hero" class="datepicker-hero">
                <div id="datepicker-hero-start" class="datepicker-hero-item datepicker-hero-start">
                    ${this.options.startDate ? startDate : this.options.locale.startDate}
                </div>
                <div class="datepicker-hero-item datepicker-hero-to">${this.options.locale.to}</div>
                <div id="datepicker-hero-end" class="datepicker-hero-item datepicker-hero-end">
                        ${this.options.endDate ? endDate : this.options.locale.endDate}
                </div>
            </div>
            <div class="datepicker-main">
                <div id="datepicker-year" class="datepicker-main-item datepicker-year">
                    <ul id="datepicker-wheel-year" class="datepicker-wheel"></ul>
                </div>
                <div id="datepicker-month" class="datepicker-main-item datepicker-month">
                    <ul id="datepicker-wheel-month" class="datepicker-wheel"></ul>
                </div>
                <div id="datepicker-day" class="datepicker-main-item datepicker-day">
                    <ul id="datepicker-wheel-day" class="datepicker-wheel"></ul>
                </div>
            </div>
        `

        // create a wrapper to DOM, and append the markup in it
        const container = document.createElement('div')
        container.id = 'datepicker-container'
        container.classList.add('datepicker-container')
        container.innerHTML = markup
        document.body.appendChild(container)

        this.el.container = container

        // generate wheels
        Array('year', 'month', 'day').map(item => {
            // camel case
            const slug = item[0].toUpperCase() + item.substring(1, item.length)

            const el = document.getElementById('datepicker-wheel-' + item)
            this.wheels[item] = new Wheel(el)

            // callback method name
            const cb = '_handle' + slug + 'Change'
            this.wheels[item].onChange = this[cb].bind(this)
        })

        // store the elements
        this.el.clear = document.getElementById('datepicker-clear')
        this.el.submit = document.getElementById('datepicker-submit')
        this.el.hero = document.getElementById('datepicker-hero')
        this.el.start = document.getElementById('datepicker-hero-start')
        this.el.end = document.getElementById('datepicker-hero-end')
        this.el.year = document.getElementById('datepicker-year')
        this.el.month = document.getElementById('datepicker-month')
        this.el.day = document.getElementById('datepicker-day')
    }

    /**
     * Binding mouse and touch events
     */
    _bindEvents() {
        // heros
        this.el.start.addEventListener('click', this._switchType.bind(this, 'start'))
        this.el.end.addEventListener('click', this._switchType.bind(this, 'end'))

        // buttons
        this.options.onClear && this.el.clear.addEventListener('click', this.options.onClear.bind(this))
        this.options.onSubmit && this.el.submit.addEventListener('click', this._handleSubmit.bind(this))
    }

    /**
     * Submit button onClick handler
     */
    _handleSubmit() {
        if (this.options.onSubmit) {
            const {startDate, endDate} = this.options

            // hide the picker if submit callback if return true
            this.options.onSubmit.call(this, {startDate, endDate}) && this.hide()
        }
    }

    /**
     * Switch type
     *
     * @return void
     */
    _switchType(type) {
        this.options.debug && console.debug(`[Type] Switch from ${this.type} to ${type}`)

        // remove the active class for the previous type
        this.el[this.type].classList.remove('datepicker-hero-active')

        // then, update active class to current type
        this.type = type
        this.el[this.type].classList.add('datepicker-hero-active')

        // regenerate year data
        const minDate = new Date(this.options.minDate)
        const maxDate = new Date(this.options.maxDate)
        const startDate = new Date(this.options.startDate)
        const endDate = new Date(this.options.endDate)
        this.wheels.year.setStore(
            utils.generateYears(
                type == 'start' ? minDate : (this.options.startDate ? startDate : minDate),
                type == 'start' ? endDate : maxDate,
                type == 'start' ? true : false,
            )
        )

        const item = this.options[this.type + 'Date']
        this.options.debug && console.debug(`[Wheel] Set value to ${item}`)
        this.wheels.year.setValue(item ? new Date(item).getFullYear() : null)
        this.wheels.month.setValue(item ? new Date(item).getMonth() + 1 : null)
        this.wheels.day.setValue(item ? new Date(item).getDate() : null)
    }

    /**
     * Year onChange handler
     *
     * @param payload object
     * @return void
     */
    _handleYearChange(year) {
        const date = this.options[this.type + 'Date']

        const minDate = new Date(this.options.minDate)
        const maxDate = new Date(this.options.maxDate)
        const startDate = new Date(this.options.startDate)
        const endDate = new Date(this.options.endDate)
        this.wheels.month.setStore(
            utils.generateMonths(
                year.value,
                this.type == 'start' ? minDate : Math.max(startDate),
                this.type == 'start' ? Math.min(maxDate, endDate) : maxDate
            )
        )

        this._handleMonthChange(
            date ?
            {text: date.getMonth() + 1 + '月', value: date.getMonth() + 1} :
            {text: '1月', value: 1}
        )

        // if prevous date is not null
        if (date) {
            if (year.value) {
                this.options[this.type + 'Date'].setFullYear(year.value)
            } else {
                this.options[this.type + 'Date'] = null
            }
        } else {
            // if previous date is null
            if (year.value) {
                this.options[this.type + 'Date'] = new Date(year.value, 0, 1)
            }
        }

        this._updateHeroTitle()
    }

    /**
     * Month onChange handler
     *
     * @param data object New month data
     * @return void
     */
    _handleMonthChange(month) {
        const date = this.options[this.type + 'Date']
        const year = this.wheels.year.getValue()

        const minDate = new Date(this.options.minDate)
        const maxDate = new Date(this.options.maxDate)
        const startDate = new Date(this.options.startDate)
        const endDate = new Date(this.options.endDate)
        this.wheels.day.setStore(
            utils.generateDays(
                year,
                month,
                this.type == 'start' ? minDate : startDate,
                this.type == 'start' ? Math.min(maxDate, endDate) : maxDate
            )
        )

        if (date && month.value) {
            this.options[this.type + 'Date'].setMonth(month.value - 1)
        }

        this._updateHeroTitle()
    }

    /**
     * Month onChange handler
     *
     * @param data object New month data
     * @return void
     */
    _handleDayChange(day) {
        const date = this.options[this.type + 'Date']

        if (date && day.value) {
            this.options[this.type + 'Date'].setDate(day.value)
        }

        this._updateHeroTitle()
    }

    /**
     * Update hero title after wheels' change
     */
    _updateHeroTitle() {
        const year = this.wheels.year.getValue()
        const month = this.wheels.month.getValue()
        const day = this.wheels.day.getValue()
    
        const title = this.el[this.type]

        const slug = this.type + 'Date'

        if (!year.value) {
            title.innerText = year.text
            return
        }

        title.innerText = year.text + month.text + day.text
    }

    /**
     * Set start date
     *
     * @param date {string|object} Start date
     * @return object This
     */
    setStartDate(date) {
        const start = date ? new Date(date) : null
        this.options.startDate = start

        if (this.type == 'start') {
            this.wheels.year.setValue(start ? start.getFullYear() : null)
        }

        this.el.start.innerText = start ? `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日` : '无限'

        return this
    }

    /**
     * Set end date
     *
     * @param date {string|object} End date
     * @return object This
     */
    setEndDate(date) {
        const end = date ? new Date(date) : null
        this.options.endDate = end

        if (this.type == 'end') {
            this.wheels.year.setValue(end ? end.getFullYear() : null)
            this.wheels.month.setValue(end ? end.getMonth() + 1 : null)
            this.wheels.day.setValue(end ? end.getDate() : null)
        }

        this.el.end.innerText = `${end.getFullYear()}年${end.getMonth() + 1}月${end.getDate()}日`

        return this
    }

    /**
     * Show the picker
     */
    show() {
        this.el.mask.style.opacity = 0
        this.el.mask.style.display = 'block'
        setTimeout(() => this.el.mask.style.opacity = 1, 0) 

        this.el.container.style.transform = 'translateY(100%)'
        this.el.container.style.display = 'block'
        setTimeout(() => this.el.container.style.transform = 'translateY(0)', 0) 

        document.body.addEventListener('touchmove', utils.preventDefault)
    }

    /**
     * Hide the picker
     */
    hide() {
        this.el.mask.style.opacity = 0
        setTimeout(() => this.el.mask.style.display = 'none', 150) 

        this.el.container.style.transform = 'translateY(100%)'
        setTimeout(() => this.el.container.style.display = 'none', 300) 

        document.body.removeEventListener('touchmove', utils.preventDefault)
    }

    /**
     * Set type for the date picker
     *
     * @param type string Selector type: {year, month, date}
     * @return object
     */
    setType(type) {
        this.options.type = type

        // update the dom we actually use
        switch (type) {
            case 'year':
                this.el.year.style.display = 'block'
                this.el.month.style.display = 'none'
                this.el.day.style.display = 'none'
                break
            case 'month':
                this.el.year.style.display = 'block'
                this.el.month.style.display = 'block'
                this.el.day.style.display = 'none'
                break
            case 'date':
                this.el.year.style.display = 'block'
                this.el.month.style.display = 'block'
                this.el.day.style.display = 'block'
                break
        }

        return this
    }

    /**
     * Set multiple option
     *
     * @param flag boolean
     * @return object
     */
    setMultiple(flag) {
        this.options.multiple = !!flag

        // display hero section if it's set to multiple option
        if (this.options.multiple) {
            this.el.hero.style.display = 'block'
        } else {
            this._switchType('start')
            this.el.hero.style.display = 'none'
        }
    }
}
