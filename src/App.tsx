import * as React from 'react';
import './App.css';
import shuffle from './shuffle';
import * as uuid from 'uuid';

type GuestType = 'commoner' | 'agent';
type Mask = 'rabbit' | 'mouse' | 'fox';
const masks: Mask[] = ['rabbit', 'mouse', 'fox'];
type Guest = {
	id: string,
	type: GuestType,
	mask: Mask,
	converted: Boolean,
	position: [number, number]
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
		const availablePositions: [number, number][] = [];
		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < 10; col++) {
				availablePositions.push([row, col]);
			}
		}
		for (let i = 0; i < 20; i++) {
			guests.push({
				id: uuid.v4(),
				type: 'commoner',
				mask: shuffle<Mask>(masks)[0],
				converted: false,
				position: shuffle(availablePositions).pop() || [-1, -1]
			})
		}
		return guests;
	}
	buildTable(): Array<Array<(Guest | null)>> {
		const table: Array<Array<(Guest | null)>> = []
		for (let row = 0; row < 10; row++) {
			const row: Array<(Guest | null)> = []
			for (let col = 0; col < 10; col++) {
				row.push(null)
			}
			table.push(row)
		}
		const turn: Turn = this.state.turns[this.state.turns.length - 1];
		if (!turn) {
			throw Error()
		}
		turn.forEach((guest: Guest) => {
			table[guest.position[0]][guest.position[1]] = guest;
		})
		return table;
	}
	render() {
		const allSpaces = this.buildTable();
		return (
			<table>
				{allSpaces.map((row: Array<(Guest | null)>, index) => (
					<tr key={index}>
						{row.map((col: Guest | null, index) => (
							<td>
								{col ? col.mask.substr(0, 1) : null}
							</td>
						))}
					</tr>
				))}
			</table>
		)
	}
}

export default App;