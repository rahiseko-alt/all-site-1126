/**
 * Play Hero Program (pure coordinates_xy from play.ertdfgcvb.xyz)
 */

export const settings = {
	fps: 60,
	renderer: 'text',
	backgroundColor: 'white',
	color: 'black',
}

const density = 'Ñ@#W$9876543210?!abc;:+=-,._ '

export function main(coord, context) {
	const { cols, frame } = context
	const { x, y } = coord
	const sign = (y % 2) * 2 - 1
	const index = (cols + y + x * sign + frame) % density.length
	return density[index]
}
