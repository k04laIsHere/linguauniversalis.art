export type Lang = 'ru' | 'en';

export type I18nDict = {
  header: {
    cave: string;
    manifesto: string;
    ancient: string;
    exit: string;
    team: string;
    events: string;
    natureUrban: string;
    gallery: string;
    contact: string;
    brandHint: string;
  };
  cave: {
    title: string;
    subtitle: string;
    manifestoTitle: string;
    manifesto: string[];
    flashlightTitle: string;
    flashlightHint: string;
    flashlightHint2: string;
  };
  ancient: {
    title: string;
  };
  exitFlight: {
    title: string;
    hint: string;
  };
  team: {
    title: string;
    hint: string;
    pause: string;
  };
  events: {
    title: string;
    hint: string;
    pause: string;
    explore: string;
    scrollDiscover: string;
  };
  gallery: {
    title: string;
    lede: string;
    searchPlaceholder: string;
    artistFilterAll: string;
    sortArtist: string;
    sortTitle: string;
    lightboxPrev: string;
    lightboxNext: string;
    lightboxClose: string;
  };
  natureUrban: {
    title: string;
    lede: string;
  };
  contact: {
    title: string;
    hint: string;
    revealedHint: string;
    emailLabel: string;
    telegramLabel: string;
    open: string;
    mail: string;
    copy: string;
    copied: string;
  };
};


