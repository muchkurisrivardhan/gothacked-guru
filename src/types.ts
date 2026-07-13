export interface ComplaintChannel {
  name: string;
  type: "helpline" | "portal" | "app" | "in-person" | "email";
  value: string;
  note?: string;
  locationAware?: boolean;
}

export interface GuideStep {
  title: string;
  detail: string;
}

export interface RealCase {
  summary: string;
  source: string;
}

export interface ScamDetail {
  warningSigns: string[];
  immediateSteps: GuideStep[];
  evidenceToGather: string[];
  howToFile: GuideStep[];
  channels: ComplaintChannel[];
  verified: boolean;
  realCase?: RealCase;
}

export interface ScamNode {
  id: string;
  title: string;
  shortLabel: string;
  summary: string;
  keywords?: string[];
  children?: ScamNode[];
  detail?: ScamDetail;
  comingSoon?: boolean;
}
