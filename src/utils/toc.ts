export type TocItem = {
  label: string;
  hash: string;
  children: TocItem[];
};
export type Toc = TocItem[];
