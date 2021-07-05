const moment = require('moment')

// 02:15 PM => 03:00 PM: Lunch

function parseTime(timeString) {
	// 02:15 PM
	const startHour = parseInt(timeString.slice(0, 2)) // 02
	const startMinute = parseInt(timeString.slice(3, 5)) // 15
	const startPeriod = timeString.slice(6, 8) // PM
	return {
		hour:
			startPeriod === 'AM' || startPeriod === 'A'
				? startHour
				: startHour + 12,
		minute: startMinute,
	}
}

function parseData(data) {
	// 02:15 PM => 03:00 PM: Lunch
	const name = data.slice(22, data.length)

	const startDateRaw = data.slice(0, 7)
	const endDataRaw = data.slice(12, 20)

	const startTime = parseTime(startDateRaw)
	const endTime = parseTime(endDataRaw)

	const startMoment = moment(`${startTime.hour}:${startTime.minute}`, 'HH:mm')
	const endMoment = moment(`${endTime.hour}:${endTime.minute}`, 'HH:mm')

	const duration = moment.duration(endMoment.diff(startMoment))
	const formatted_duration = duration.asMinutes()

	// console.log(name)
	// console.log(startMoment.format('HH:mm'))
	// console.log(endMoment.format('HH:mm'))
	// console.log(formatted_duration)

	return {
		name: name,
		start: startTime,
		end: endTime,
		duration: formatted_duration,
	}
}

function process(data) {
	const raw = data.map((block) => parseData(block))
	let final = []
	raw.forEach((el) => {
		const indexOfDuplicate = final.findIndex(
			(e) =>
				e.name === el.name &&
				JSON.stringify(e.end) === JSON.stringify(el.start)
		)
		if (indexOfDuplicate === -1) {
			final.push(el)
			return
		}
		const duplicate = final[indexOfDuplicate]
		const isContinuation =
			JSON.stringify(duplicate.end) === JSON.stringify(el.start)
		if (indexOfDuplicate !== -1 && isContinuation) {
			final[indexOfDuplicate].end = el.end
			final[indexOfDuplicate].duration = duplicate.duration + el.duration
		} else {
			final.push(el)
		}
	})
	// final = raw
	return final
}

function main() {
	const rawData = `
07:00 AM => 11:40 AM: School
11:40 AM => 12:15 AM: Break
12:15 AM => 01:15 PM: Development
01:15 PM => 02:15 PM: Homework
02:15 PM => 03:00 PM: Lunch
03:00 PM => 04:00 PM: Entertainment
04:00 PM => 05:00 PM: Entertainment
05:00 PM => 06:00 PM: Studies
06:00 PM => 07:00 PM: Studies
07:00 PM => 08:00 PM: Studies
08:00 PM => 08:30 PM: Dinner
08:30 PM => 09:30 PM: Homework
09:30 PM => 10:30 PM: Development
10:30 PM => 11:30 PM: Development
`
	const data = rawData.split('\n').filter((e) => e !== '')
	return data
}

main()

module.exports = {
	process: (data) => process(data),
}
