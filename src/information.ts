

const converted = () => randomAnswer([
	'I\'m not telling you anything. They promised me good coin.',
	'Why would I tell you? Where were YOU when I needed help?',
	'I pledged my life to the Zhentarim. I\'m not helping you.',
	'Yeah, they recruited me. Here\'s a tip free of charge: you smell like an arse.',
	'Get lost! The Zhentarim will take care of me.',
	'I changed my allegiances from the Xanathar to the Zhentarim. But to YOU, I tell nothing.',
	'Leave me be! Maybe I should let my new bosses know someone is looking for them.',
	'I had no choice but to join up with the Zhentarim. Look at me, I haven\'t eaten in days. It would be wrong to rat them out now.'
]);

const tooFarAway = () => randomAnswer([
	'Zhentarim? Never heard of them.',
	'I haven\'t seen any shady people, no, but would you like to dance?',
	'Hic! Tellya the truf I\'m farily drunk.',
	'Haven\'t seen no agent, now leave me be!',
	'An agent? I\'m not an agent of Xanathar! Oh, you were asking about the Zhentarim? Haven\'t seen one, no.'
])

const nextTo = () => randomAnswer([
	'This guy next to me is super suspicious!',
	'I just bumped into someone who fits that description!',
	'Psst! He\'s RIGHT HERE! You would do the Xanathar... ehm, I mean the people, a great service if you killed him!',
	'See that guy behind my shoulders? Super shady!'
]);

const closeBy = () => randomAnswer([
	'I think I saw a man with a snake tattoo not too far away!',
	'Yeah I saw the guy not long ago. He was quite handsome! Wanted to dance with him but he was caught up in a conversation.',
	'I overheard someone talking about the Zhentarim, trying to recruit into their ranks not far away!',
	'My eyes are not what they used to be, but I think I saw someone that fits that description.',
	'Looking for a Zhent agent? He he. Yeah, you don\'t have to go far. Slip a dagger between his ribs, would ya, you would spare me the trouble.'
]);

const change = (mask: string) => randomAnswer([
	`I saw a suspicious man change from a ${mask} mask not too long ago!`,
	`These woodland creatures are all so cute! Saw a man change his ${mask} mask to something else, guess he couldn\'t choose!`,
	`When this man changed his ${mask} mask, I saw a snake tattoo reveal itself on his head!`,
	`A Zhent agent changed his ${mask} mask into something else not long ago, Quick! Get him!`
])

const wrongfulAccusation = () => randomAnswer([
	'WHAT ARE YOU DOING? I\'m calling the city watch!',
	'Get your hands off me! Who do you think you are?',
	'A man can\'t have some fun without being harassed! I hate this city!',
	'Go back to your hideout you thug!',
	'Damn the Xanathar! Damn the Zhentarim! Damn this whole godforsaken city.'
])

function randomAnswer(answers: string[]): string {
	const rnd = Math.floor(Math.random() * answers.length);
	return answers[rnd];
}

export {
	converted,
	tooFarAway,
	nextTo,
	closeBy,
	change,
	wrongfulAccusation
}