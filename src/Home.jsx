import React, { useState, useEffect, useCallback } from 'react'
import moment from 'moment'
import { process } from './parser'

const DEFAULT_DATA = `
07:00 AM => 12:00 AM: Morning
12:00 AM => 05:30 PM: Afternoon
05:30 PM => 09:00 PM: Evening 
09:00 PM => 07:00 AM: Night
`

function Home() {
	const [time, setTime] = useState(new Date())
	const [currentBlock, setCurrentBlock] = useState({})
	const [data, setData] = useState([])
	const [textData, setTextData] = useState('')

	// Set current block
	function calculateCurrentBlock(d) {
		console.log(d)
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
					start: startDate.toISOString(),
					end: endDate.toISOString(),
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
		const currentBlockInterval = setInterval(
			() => calculateCurrentBlock(data),
			5000
		)
		return () => {
			clearInterval(timeInterval)
			clearInterval(currentBlockInterval)
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
							{currentBlock.name} started{' '}
							{moment
								.duration(
									moment(time).diff(
										moment(currentBlock.start)
									)
								)
								.humanize()}{' '}
							ago and ends in{' '}
							{moment
								.duration(
									moment(time).diff(moment(currentBlock.end))
								)
								.humanize()}
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
					<div className="spaced">
						Please make sure that you use the correct format
						(format's already there in the default schedule) to edit
					</div>
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
