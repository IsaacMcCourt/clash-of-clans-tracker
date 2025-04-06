export interface Builder {
  id: string;
  name: string;
  endTime: string | null; // ISO string for end time
  inUse: boolean;
}

export interface Laboratory {
  id: string;
  endTime: string | null; // ISO string for end time
  inUse: boolean;
}

export interface Account {
  id: string;
  name: string;
  mainVillageBuilders: Builder[];
  mainVillageLab: Laboratory;
  builderBaseBuilders: Builder[];
  builderBaseLab: Laboratory;
}