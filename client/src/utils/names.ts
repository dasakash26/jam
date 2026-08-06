import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
  NumberDictionary,
} from 'unique-names-generator'

const numberDictionary = NumberDictionary.generate({ min: 10, max: 99 })

export function generateUsername(): string {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals, numberDictionary],
    length: 3,
    separator: '_',
    style: 'capital',
  })
}

export function generateRandomRoomName(): string {
  const jamAdjectives = [
    'Groove',
    'Lo-Fi',
    'Bassment',
    'Acoustic',
    'Funk',
    'Stereo',
    'Vinyl',
    'Sonic',
    'Electric',
    'Jazz',
    'Indie',
    'Psychedelic',
  ]

  const jamVenues = [
    'Jam Shack',
    'Boiler Room',
    'Attic',
    'Vault',
    'Sanctuary',
    'Garage',
    'Oasis',
    'Frequency',
    'Den',
    'Corner',
  ]

  const adj = jamAdjectives[Math.floor(Math.random() * jamAdjectives.length)]
  const venue = jamVenues[Math.floor(Math.random() * jamVenues.length)]
  const num = Math.floor(10 + Math.random() * 90)

  return `${adj} ${venue} ${num}`
}
