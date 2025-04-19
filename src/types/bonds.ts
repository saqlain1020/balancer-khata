export interface BondCategory {
  name: string;
  bonds: number[];
}

export interface Person {
  id: string;
  name: string;
  categories: BondCategory[];
}

export type PersonBonds = Person[];
