import * as React from 'react';
import './App.css';
import shuffle from './shuffle';
import * as uuid from 'uuid';
import classnames from 'classnames'
import { converted, tooFarAway, nextTo, closeBy, change } from './information';

const NUMBER_OF_GUESTS = 35;
const NUMBER_OF_AGENTS = 3;
const MAP_SIZE = 10;
const STARTING_CONVERTED = 3;

type GuestType = 'commoner' | 'agent';
type Mask = 'bear' | 'rabbit' | 'fox';
const masks: Mask[] = ['bear', 'rabbit', 'fox'];
type Guest = {
	id: string,
	type: GuestType,
	mask: Mask,
	converted: Boolean,
	position: Position
}

type Information = {
	guest: Guest,
	information: string
}

class Position {
	row: number;
	col: number;
	constructor(row: number, col: number) {
		this.row = row;
		this.col = col;
	}
	copy(modRow: number, modCol: number): Position {
		return new Position(this.row + modRow, this.col + modCol);
	}
	equals(pos: Position): boolean {
		return this.row === pos.row && this.col === pos.col;
	}
	distanceTo(pos: Position): number {
		return Math.max(Math.abs(pos.row - this.row), Math.abs(pos.col - this.col))
	}
	neighboring(guests: Turn): number {
		return guests.filter(guest => this.distanceTo(guest.position) === 1).length;
	}

}

type Turn = Guest[];

type State = {
	turns: Turn[],
	selected: Guest | void,
	information: Information[]
}

class App extends React.Component<{}, State> {
	state: State = {
		turns: [],
		selected: undefined,
		information: []
	}
	componentWillMount() {
		this.setState({
			turns: [this.createInitialState()]
		});
	}
	createInitialState(): Turn {
		const guests: Turn = []
		const notShuffledAvailablePositions: Position[] = [];
		for (let row = 0; row < MAP_SIZE; row++) {
			for (let col = 0; col < MAP_SIZE; col++) {
				notShuffledAvailablePositions.push(new Position(row, col));
			}
		}
		const availablePositions = shuffle(notShuffledAvailablePositions);
		for (let i = 0; i < NUMBER_OF_GUESTS; i++) {
			const pos = availablePositions.pop();
			if (!pos) {
				throw Error()
			}
			guests.push({
				id: uuid.v4(),
				type: 'commoner',
				mask: shuffle<Mask>(masks)[0],
				converted: false,
				position: pos
			})
		}
		for (let i = 0; i < NUMBER_OF_AGENTS; i++) {
			const pos = availablePositions.pop();
			if (!pos) {
				throw Error()
			}
			guests.push({
				id: uuid.v4(),
				type: 'agent',
				mask: shuffle<Mask>(masks)[0],
				converted: false,
				position: pos
			})
		}
		// Starting converted
		for (let c = 0; c < STARTING_CONVERTED; c++) {
			const unconverted = guests.filter(g => !g.converted);
			const target = shuffle(unconverted)[0]
			guests[unconverted.indexOf(target)].converted = true;
		}
		return guests;
	}
	buildTable(): Array<Array<(Guest | null)>> {
		const table: Array<Array<(Guest | null)>> = []
		for (let row = 0; row < MAP_SIZE; row++) {
			const row: Array<(Guest | null)> = []
			for (let col = 0; col < MAP_SIZE; col++) {
				row.push(null)
			}
			table.push(row)
		}
		const turn: Turn = this.state.turns[this.state.turns.length - 1];
		if (!turn) {
			throw Error()
		}
		turn.forEach((guest: Guest) => {
			table[guest.position.row][guest.position.col] = guest;
		})
		return table;
	}
	nextTurn = () => {
		const currentTurn: Turn = this.state.turns[this.state.turns.length - 1];
		const occupiedSpaces: Position[] = [];
		const isOccupied = (pos: Position): boolean => {
			return !!occupiedSpaces.find(space => space.equals(pos));
		}
		const newTurn = currentTurn.map((guest: Guest, index, arr) => {
			if (guest.type !== 'agent' && Math.random() < 0.5) {
				return guest;
			}
			const oldPosition = guest.position;
			const possiblePositions = [
				oldPosition.copy(-1, -1), oldPosition.copy(-1, 0), oldPosition.copy(-1, 1),
				oldPosition.copy(0, -1), /* current pos */ oldPosition.copy(0, 1),
				oldPosition.copy(1, -1), oldPosition.copy(1, 0), oldPosition.copy(1, 1),
			].filter(pos => {
				return !pos.equals(oldPosition) && pos.row > -1 && pos.col > -1 && pos.row < MAP_SIZE && pos.col < MAP_SIZE
			})
			if (possiblePositions.length === 0) {
				return guest;
			}
			let newPosition: Position = guest.position.copy(0, 0);
			do {
				newPosition = shuffle(possiblePositions)[0]
			} while (isOccupied(newPosition));
			occupiedSpaces.push(newPosition)
			return {
				...guest,
				position: newPosition,
				mask: guest.type === 'agent' ? shuffle(masks.filter(mask => mask !== guest.mask))[0] : guest.mask
			}
		})
		// The agents convert people
		const agents = newTurn.filter(guest => guest.type === 'agent');
		agents.forEach(agent => {
			const uncovertedCommoners = newTurn.filter(guest => guest.type === 'commoner' && !guest.converted);
			const nextTo = uncovertedCommoners.filter(commoner => agent.position.distanceTo(commoner.position) === 1);
			if (nextTo.length > 0) {
				shuffle(nextTo)[0].converted = true;
			}
		})
		this.setState({
			turns: [...this.state.turns, newTurn],
			selected: undefined,
			information: []
		})
	}
	select = (guest: Guest) => {
		this.setState({
			selected: guest
		})
	}
	investigate = (insightSuccess: boolean) => {
		const guest = this.state.selected;
		const currentTurn = this.state.turns[this.state.turns.length -1]
		if (!guest) {
			return;
		}
		if (insightSuccess && guest.type === 'agent') {
			alert('Eeek! I\'m compromised!');
			return this.setState({
				turns: [...this.state.turns.slice(0, this.state.turns.length - 1),
					this.state.turns[this.state.turns.length - 1].filter(g => g !== guest)]
			})
		}
		let info = 'No info';
		const random = Math.random() * 100;
		if (guest.converted) {
			info = converted();
		} else if (this.state.turns.length === 1 || random < 60) {
			// Distance to agent
			const agents = currentTurn.filter(guest => guest.type === 'agent');
			const distances = agents.map(agent => guest.position.distanceTo(agent.position))
			const targetAgentDistance = Math.max(Math.min(...distances), 0)
			if (targetAgentDistance > 3) {
				info = tooFarAway()
			} else if (targetAgentDistance < 2 && guest.position.neighboring(currentTurn) > 1 ) {
				info = nextTo()
			} else {
				info = closeBy()
			}
		} else {
			const previousRound = this.state.turns[this.state.turns.length -2];
			const agents = previousRound.filter(guest => guest.type === 'agent');
			const distances = agents.map(agent => guest.position.distanceTo(agent.position))
			const targetAgentDistance = Math.max(Math.min(...distances), 0)
			const closestAgent = agents[distances.indexOf(targetAgentDistance)];
			info = change(closestAgent.mask)
		}
		this.setState({
			information: [...this.state.information, {
				guest,
				information: info
			}]
		})
	}
	render() {
		const allSpaces = this.buildTable();
		const selectedInformation = this.state.selected && this.state.information.find(info => info.guest === this.state.selected);
		const currentTurn = this.state.turns[this.state.turns.length - 1];
		return (
			<div className="container">
				<table>
					<tbody>
						{allSpaces.map((row: Array<(Guest | null)>, index) => (
							<tr key={index}>
								{row.map((col: Guest | null, index) => (
									<td
										key={index}
										onClick={col ? () => this.select(col) : undefined}
										className={classnames({
											selected: this.state.selected === col,
											questionedThisRound: this.state.information.find(info => info.guest === col),
											converted: col && col.converted,
											agent: col && col.type === 'agent'
										})}
									>
										{col && <img src={`${col.mask}.png`} />}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
				<div className="tools">
					<div>
						{this.state.selected && selectedInformation ? (
								<p className="quote">"{selectedInformation.information}"</p>
							) : this.state.selected ? (
								<>
									<button onClick={() => this.investigate(false)}>Investigate (failed Insight)</button>
									<button onClick={() => this.investigate(true)}>Investigate (successful Insight)</button>
								</>
							) : null}
					</div>
					<footer>
						<p>
							Converted people: {currentTurn.filter(guest => guest.converted).length}
						</p>
						<button onClick={this.nextTurn}>Next turn</button>
					</footer>
				</div>

			</div>
		)
	}
}

export default App;