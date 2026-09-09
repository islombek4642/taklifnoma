import type { InvitationDto, InvitationInputDto } from "../../services/api-client.js";

export interface BuilderFormState {
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string;
  greetingText: string;
  musicTrackId: string;
  templateId: string;
}

export const INITIAL_BUILDER_FORM_STATE: BuilderFormState = {
  groomName: "",
  brideName: "",
  eventDate: "",
  eventTime: "",
  venueName: "",
  venueAddress: "",
  mapUrl: "",
  greetingText: "",
  musicTrackId: "",
  templateId: "",
};

export const BUILDER_STEP_COUNT = 5;

export function isStepValid(step: number, state: BuilderFormState): boolean {
  switch (step) {
    case 0:
      return state.groomName.trim().length > 0 && state.brideName.trim().length > 0;
    case 1:
      return state.eventDate.length > 0 && state.eventTime.length > 0;
    case 2:
      return state.venueName.trim().length > 0 && state.venueAddress.trim().length > 0;
    case 3:
      return true;
    case 4:
      return state.musicTrackId.length > 0;
    default:
      return false;
  }
}

export function toInvitationInput(state: BuilderFormState): InvitationInputDto {
  const mapUrl = state.mapUrl.trim();
  const greetingText = state.greetingText.trim();

  return {
    groomName: state.groomName.trim(),
    brideName: state.brideName.trim(),
    eventDateTime: new Date(`${state.eventDate}T${state.eventTime}:00`).toISOString(),
    venueName: state.venueName.trim(),
    venueAddress: state.venueAddress.trim(),
    mapUrl: mapUrl.length > 0 ? mapUrl : undefined,
    greetingText: greetingText.length > 0 ? greetingText : undefined,
    musicTrackId: state.musicTrackId,
    templateId: state.templateId,
  };
}

export function fromInvitation(invitation: InvitationDto): BuilderFormState {
  const date = new Date(invitation.eventDateTime);
  return {
    groomName: invitation.groomName,
    brideName: invitation.brideName,
    eventDate: date.toISOString().slice(0, 10),
    eventTime: date.toISOString().slice(11, 16),
    venueName: invitation.venueName,
    venueAddress: invitation.venueAddress,
    mapUrl: invitation.mapUrl ?? "",
    greetingText: invitation.greetingText ?? "",
    musicTrackId: invitation.musicTrackId,
    templateId: invitation.templateId,
  };
}
