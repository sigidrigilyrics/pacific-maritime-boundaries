export type Status = "Completed" | "In Progress" | "Not Started" | "No Data";

export type Country = {
  id: string;
  name: string;
  code: string;
  flag: string;
  capital: string;
  region: string;
  eezArea: string;
  treaties: number;
  highSeasPockets: number;
  ecsStatus: string;
  depositedStatus: string;
  boundaryStatus: Status;
  unclosStatus: string;
  map: { x: number; y: number; w: number; h: number; tone: "cyan" | "purple" | "green" | "amber" };
  summary: string;
  related: string[];
};

export type Treaty = {
  id: string;
  title: string;
  parties: string[];
  status: string;
  signed: string;
  boundaryType: string;
  documents: number;
};

export type Dataset = {
  id: string;
  title: string;
  category: string;
  records: string;
  updated: string;
  version: string;
};

export type EcsRecord = {
  id: string;
  country: string;
  status: string;
  submitted: string;
  recommendation: string;
};
