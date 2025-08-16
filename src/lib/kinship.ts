export const KINSHIP_LABELS = {
  tosk: {
    grandfather: 'gjyshi',
    grandmother: 'gjyshja', 
    father: 'baba',
    mother: 'mama',
    paternal_uncle: 'xhaxhi',
    maternal_uncle: 'daja',
    paternal_aunt: 'halla',
    maternal_aunt: 'tezja',
    cousin_male: 'kushëri',
    cousin_female: 'kushërira',
    brother: 'vëlla',
    sister: 'motër',
    son: 'bir',
    daughter: 'bijë',
    spouse: 'bashkëshort/e',
    nephew: 'nip',
    niece: 'mbesë'
  },
  gheg: {
    grandfather: 'gjyshi',
    grandmother: 'gjyshja',
    father: 'baba',
    mother: 'nana',
    paternal_uncle: 'xhaxhi', 
    maternal_uncle: 'daja',
    paternal_aunt: 'halla',
    maternal_aunt: 'tezja',
    cousin_male: 'kusheri',
    cousin_female: 'kusherinë',
    brother: 'vlla',
    sister: 'motër',
    son: 'bir',
    daughter: 'bijë',
    spouse: 'bashkëshort/e',
    nephew: 'nip',
    niece: 'mbesë'
  }
} as const;

export type Dialect = 'tosk' | 'gheg';
export type KinshipRole = keyof typeof KINSHIP_LABELS.tosk;

export const RELATION_TYPES = [
  'parent',
  'child', 
  'sibling',
  'spouse',
  'grandparent',
  'grandchild',
  'uncle_aunt',
  'nephew_niece',
  'cousin'
] as const;

export type RelationType = typeof RELATION_TYPES[number];

export function getKinshipLabel(role: KinshipRole, dialect: Dialect): string {
  return KINSHIP_LABELS[dialect][role];
}

export function generatePublicSlug(): string {
  return Math.random().toString(36).substring(2, 15);
}