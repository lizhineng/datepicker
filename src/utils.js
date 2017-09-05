/**
 * Generate years between start and end
 *
 * @param start mixed Start date
 * @param end mixed End date
 * @return array
 */
function generateYears(start, end, hasInfinite = false) {
    const startDate = new Date(start)
    const endDate = new Date(end)

    const years = []
    while (startDate.getFullYear() <= endDate.getFullYear()) {
        years.push({
            text: startDate.getFullYear() + '年',
            value: startDate.getFullYear()
        })

        startDate.setYear(startDate.getFullYear() + 1)
    }

    // Add infinite options if has infinite option
    hasInfinite && years.push({
        text: '无限',
        value: null
    })

    return years
}

/**
 * Generate months according to year
 *
 * @param year string Year
 * @param min string Min date
 * @param max string Max date
 * @return array
 */
function generateMonths(year, min = null, max = null) {
    if (!year) {
        return [{text: '无限', value: null}]
    }

    // the months which need to be generated
    let start = 1
    let end = 12
    const minDate = new Date(min)
    const maxDate = new Date(max)

    if (min) {
        if (year == minDate.getFullYear()) {
            start = minDate.getMonth() + 1
        }
    }

    if (max) {
        // if generated year is same with the year of max date
        if (maxDate.getFullYear() == year && maxDate.getMonth() < 11) {
            end = maxDate.getMonth() + 1
        }
    }

    const data = []
    for (let i = start; i <= end; i++) {
        data.push({
            text: i + '月',
            value: i
        })
    }

    return data
}

/**
 * Generate months according to year and month
 *
 * @param year object Year
 * @param month object Month
 * @param min string Minimal date
 * @param max string Maximal date
 * @return array
 */
function generateDays(year, month, min = null, max = null) {
    if (!year.value || !month.value) {
        return [{text: '无限', value: null}]
    }

    let start = 1
    let end = new Date(year.value, month.value, 0).getDate()

    // calculate the minimal days according to min date
    if (min) {
        const minDate = new Date(min)
        if (minDate.getFullYear() == year.value &&
            minDate.getMonth() + 1 == month.value) {
            start = minDate.getDate()
        }
    }

    // calculate the maximal days according to max date
    if (max) {
        const maxDate = new Date(max)
        if (maxDate.getFullYear() == year.value &&
            maxDate.getMonth() + 1 == month.value) {
            end = maxDate.getDate()
        }
    }

    const data = []
    for (let i = start; i <= end; ++i) {
        data.push({
            text: i + '日',
            value: i
        })
    }

    return data
}

/**
 * Convert the date object to formatted string
 *
 * @param date mixed Date
 * @param format string Format (TODO)
 * @return string
 */
function dateFormat(date, format) {
    const d = new Date(date)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * Prevent default handler
 *
 * @return void
 */
function preventDefault(e) {
    e.preventDefault()
}

module.exports = {
    generateYears,
    generateMonths,
    generateDays,
    dateFormat,
    preventDefault
}
