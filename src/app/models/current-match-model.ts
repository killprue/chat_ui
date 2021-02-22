export interface CurrentMatchModel {
  roomInfo: {
    userType: string,
    activatedDate: string,
    roomId: string
  },
  hasActiveMatch: boolean;
  isQueued:boolean;
}
