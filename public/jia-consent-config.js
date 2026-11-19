window.JIA_CONSENT = {
  color: '#c8212d',
  onColor: '#ffffff',
  simple: true,
  compact: true,
  fab: true,
  fabBottom: 76,
  bannerBottom: 76,
  policyUrl: 'https://jiacpr.com/terms'
};

// All JIA sites keep ad personalization disabled.
window.dataLayer = window.dataLayer || [];
window.gtag = function (command, action, settings) {
  if (command === 'consent' && settings) settings.ad_personalization = 'denied';
  window.dataLayer.push(arguments);
};
