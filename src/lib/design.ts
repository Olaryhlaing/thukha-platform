/* ThuKha canvas format — Dev 1 owns this contract (DEV1-DETAILED-GUIDE.md §4).
   Dev 2 must use these types exactly; change only by agreement. */

export const FORMATS = [
  { id: "1080x1080", label: "Facebook post — 1080 × 1080", width: 1080, height: 1080 },
  { id: "story", label: "Story — 1080 × 1920", width: 1080, height: 1920 },
  { id: "cover", label: "Cover / card — 1200 × 630", width: 1200, height: 630 },
] as const;

export type FormatId = (typeof FORMATS)[number]["id"];

export type Layer =
  | { id: string; type: "background"; src: string }
  | {
      id: string;
      type: "text";
      text: string;
      x: number;
      y: number;
      fontSize: number;
      color: string;
      align: "center";
      rotation: number;
    }
  | {
      id: string;
      type: "logo";
      src: string;
      x: number;
      y: number;
      width: number;
      rotation: number;
    };

export type DesignJson = {
  version: 1;
  format: string;
  layers: Layer[];
};

export type Brief = {
  businessType: string;
  businessName: string;
  product: string;
  target: string;
  goal: string;
  channel: string;
  budget: string;
};
