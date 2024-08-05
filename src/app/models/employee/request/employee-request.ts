import { AuthorizationRequest } from "./authorization-request";
import { ChiefRemarksRequest } from "./chief-remarks-request";
import { OtherRemarksRequest } from "./other-remarks-request";
import { PersonRequest } from "./person-request";
import { RemunerationRequest } from "./remuneration-request";

export class EmployeeRequest {
  person: PersonRequest;
  startDate: Date;
  reasonForIncorporation: string;
  workload: number;
  workdayType: string;
  contractType: string;
  contractFrom: Date;
  contractTo: Date;
  chiefRemarks: ChiefRemarksRequest;
  remuneration: RemunerationRequest;
  otherRemarks: OtherRemarksRequest;
  authorization: AuthorizationRequest;
  referentId: number;
  isReferent: boolean;

  constructor() {
    this.person = new PersonRequest();
    this.startDate = new Date();
    this.reasonForIncorporation = '';
    this.workload = 0;
    this.workdayType = '';
    this.contractType = '';
    this.contractFrom = new Date();
    this.contractTo = new Date();
    this.chiefRemarks = new ChiefRemarksRequest();
    this.remuneration = new RemunerationRequest();
    this.otherRemarks = new OtherRemarksRequest();
    this.authorization = new AuthorizationRequest();
    this.referentId = 0;
    this.isReferent = false;
  }
}