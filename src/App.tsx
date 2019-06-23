import * as React from 'react';
import './App.css';
import shuffle from './shuffle';
import * as uuid from 'uuid';

const NUMBER_OF_GUESTS = 25;
const NUMBER_OF_AGENTS = 2;
const MAP_SIZE = 10;

type GuestType = 'commoner' | 'agent';
type Mask = 'rabbit' | 'mouse' | 'fox';
const masks: Mask[] = ['rabbit', 'mouse', 'fox'];
type Guest = {
	id: string,
	type: GuestType,
	mask: Mask,
	converted: Boolean,
	position: Position
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

}

type Turn = Guest[];

type State = {
	turns: Turn[]
}

class App extends React.Component {
	state = {
		turns: []
	}
	componentWillMount() {
		this.setState({
			turns: [this.createInitialState()]
		});
	}
	createInitialState(): Turn {
		const guests: Turn = []
		const availablePositions: Position[] = [];
		for (let row = 0; row < MAP_SIZE; row++) {
			for (let col = 0; col < MAP_SIZE; col++) {
				availablePositions.push(new Position(row, col));
			}
		}
		for (let i = 0; i < NUMBER_OF_GUESTS; i++) {
			guests.push({
				id: uuid.v4(),
				type: 'commoner',
				mask: shuffle<Mask>(masks)[0],
				converted: false,
				position: shuffle(availablePositions).pop() || new Position(-1, -1)
			})
		}
		for (let i = 0; i < NUMBER_OF_AGENTS; i++) {
			guests.push({
				id: uuid.v4(),
				type: 'agent',
				mask: shuffle<Mask>(masks)[0],
				converted: false,
				position: shuffle(availablePositions).pop() || new Position(-1, -1)
			})
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
			return {
				...guest,
				position: newPosition
			}
		})
		this.setState({
			turns: [...this.state.turns, newTurn]
		})
	}
	render() {
		const allSpaces = this.buildTable();
		return (
			<>
				<table>
					<tbody>
						{allSpaces.map((row: Array<(Guest | null)>, index) => (
							<tr key={index}>
								{row.map((col: Guest | null, index) => (
									<td key={index}>
										{col ? col.mask.substr(0, 1) : null}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
				<button onClick={this.nextTurn}>Next turn</button>
			</>
		)
	}
}

export default App;