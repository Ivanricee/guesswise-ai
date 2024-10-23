type FeedbackPrompt = {
  character: string
}
export const validCharacterPromt = ({ character }: FeedbackPrompt) => {
  const promt = `Is "${character}" linked to horror, Halloween, Día de Muertos, or similar themes?
  If yes, respond briefly. If no, reply without explanations and provide 3 alternatives in Spanish
  related to Halloween or Día de Muertos, ensuring they are suitable for dressing up as like espantapajaros.
Only one response should contain data.
Eg: Valid: 'catrin ¡Gran elección!' Invalid: ''.  Valid: '' Invalid: 'no hay relacion.Te recomiendo: pennywise, espantapajaros, catrin.'
`
  return promt
}
type IsValidCharacterPrompt = {
  character: string
  guessCharacter: string
}
export const isValidCharacterPromt = ({ character, guessCharacter }: IsValidCharacterPrompt) => {
  const promt = `Compare two words referring to horror characters. If they are the same, even with errors, alternate names,
  or in another language, return true; otherwise, return false. Eg: "It" and "Pennywise" → true "Michael Myers" and "Ghostface" → false'
  compare "${character}" with "${guessCharacter}"`
  console.log('is character', { promt })
  return promt
}
export const OPENAI_KEY = process.env.OPENAI_API_KEY
