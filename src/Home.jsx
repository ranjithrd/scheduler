import React, { useState, useEffect, useCallback } from 'react'
import moment from 'moment'
import { process } from './parser'

const DEFAULT_DATA = `
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

function Home() {
	const [time, setTime] = useState(new Date())
	const [currentBlock, setCurrentBlock] = useState({})
	const [data, setData] = useState([])
	const [textData, setTextData] = useState('')

	// Set current block
	function calculateCurrentBlock(d) {
		let current
		d.forEach((block) => {
			const startDate = moment(
				`${block.start.hour}:${block.start.minute}`,
				'HH:mm'
			)
			const endDate = moment(
				`${block.end.hour}:${block.end.minute}`,
				'HH:mm'
			)
			const blockIsCurrent = moment().isBetween(startDate, endDate)
			if (blockIsCurrent) {
				current = {
					...block,
					start: startDate.fromNow(),
					end: endDate.fromNow(),
				}
			}
		})
		setCurrentBlock(current)
	}

	// On change textarea
	function onDataChange(d) {
		console.log('Changed Data')
		console.log(d)
		setTextData(d)
		localStorage.setItem('schedule', d)
	}

	// Changes time
	async function onInterval() {
		setTime(new Date())
	}

	function loadLocalStorage() {
		const lsItem = localStorage.getItem('schedule')
		if (lsItem === null) {
			console.log('LocalStorage Item Does Not Exist')
			localStorage.setItem('schedule', DEFAULT_DATA)
		}
		console.log(`Set LS Item to ${localStorage.getItem('schedule')}`)
		setTextData(localStorage.getItem('schedule'))
	}

	// Parse textData
	const parseData = useCallback(() => {
		// Cleans text data
		const cleanedTextData = textData.split('\n').filter((e) => e !== '')
		// Parses and sets processed data
		const parsedData = process(cleanedTextData)
		console.log(parsedData)
		setData(parsedData)
		console.log('Parsed data')
		// console.log(data)
	}, [textData])

	// Set data when textData changes
	useEffect(() => {
		console.log('Text data has changed')
		console.log(textData)
		parseData()
	}, [textData, parseData])

	useEffect(() => {
		calculateCurrentBlock(data)
	}, [data])

	// Handles intervals
	useEffect(() => {
		console.log('Loading localstorage')
		loadLocalStorage()
		// Interval logic
		const timeInterval = setInterval(onInterval, 500)
		return () => {
			clearInterval(timeInterval)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div>
			<div className="hero">
				<div className="column">
					<h1>{currentBlock?.name ?? 'Nothing now'}</h1>
					<h3>{moment(time).format('HH:mm:ss')}</h3>
					{currentBlock !== undefined ? (
						<sub>
							{currentBlock.name} started {currentBlock.start} and
							ends {currentBlock.end}
							<br></br>
							Lasts{' '}
							{moment
								.duration(currentBlock.duration * 60 * 1000)
								.humanize()}
						</sub>
					) : (
						''
					)}
				</div>
			</div>
			<h3>Schedule</h3>
			{data.map((block) => {
				// const blockHeight = block
				const startTime = moment(
					`${block.start.hour}:${block.start.minute}`,
					'HH:mm'
				).format('HH:mm')
				const endTime = moment(
					`${block.end.hour}:${block.end.minute}`,
					'HH:mm'
				).format('HH:mm')
				return (
					<div className="card">
						<div className="title">{block.name}</div>
						<sub>
							Starts at {startTime}, ends at {endTime}. Lasts{' '}
							{moment
								.duration(block.duration * 60 * 1000)
								.humanize()}
						</sub>
					</div>
				)
			})}
			<div className="hero">
				<div className="textarea">
					<textarea
						name="schedule"
						id="schedule"
						value={textData}
						onChange={(e) => onDataChange(e.target.value)}
					></textarea>
				</div>
			</div>
		</div>
	)
}

export default Home
