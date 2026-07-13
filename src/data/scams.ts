import type { ScamNode, ComplaintChannel } from "../types";

// ---- Shared complaint channels (reused across multiple scam types) ----

const CYBER_HELPLINE: ComplaintChannel = {
  name: "National Cyber Crime Helpline",
  type: "helpline",
  value: "1930",
  note: "Call this first, as fast as possible. If money was paid/transferred, a fast report can trigger a freeze on the receiving account before it's withdrawn.",
};

const CYBER_PORTAL: ComplaintChannel = {
  name: "National Cyber Crime Reporting Portal",
  type: "portal",
  value: "cybercrime.gov.in",
  note: "File a full written complaint here after calling 1930. You'll get an acknowledgement/complaint number — save it.",
};

const LOCAL_CYBER_CELL: ComplaintChannel = {
  name: "Local Cyber Crime Police Station",
  type: "in-person",
  value: "Nearest Cyber Cell in your city",
  note: "Needed if you require an FIR copy (e.g. for bank disputes, insurance, or if the case needs active investigation).",
  locationAware: true,
};

const WOMEN_HELPLINE: ComplaintChannel = {
  name: "Women Helpline (24x7)",
  type: "helpline",
  value: "181",
  note: "For women and girls facing harassment, blackmail, or abuse. Can also connect you to counselling support.",
};

const CHILDLINE: ComplaintChannel = {
  name: "Childline (if victim is under 18)",
  type: "helpline",
  value: "1098",
  note: "Use this if the person being blackmailed/harassed is a minor.",
};

const NCW_PORTAL: ComplaintChannel = {
  name: "National Commission for Women — Online Complaint",
  type: "portal",
  value: "ncwapps.nic.in",
  note: "For women facing online blackmail/harassment, alongside the cyber crime portal.",
};

const RBI_SACHET: ComplaintChannel = {
  name: "RBI Sachet Portal",
  type: "portal",
  value: "sachet.rbi.org.in",
  note: "Report illegal/unregistered digital lending apps here.",
};

const SEBI_SCORES: ComplaintChannel = {
  name: "SEBI SCORES (investment fraud)",
  type: "portal",
  value: "scores.sebi.gov.in",
  // ponytail: NotebookLM's source also gave a shorturl.at link for SEBI's IA-verification
  // tool — not hardcoding a shortened link on a scam site. Point people to search
  // "SEBI registered investment advisor check" on sebi.gov.in instead.
  note: "For fraud involving stock market tips, trading groups, or fake advisors. To check if an advisor is genuinely SEBI-registered, search 'SEBI registered investment advisor check' on sebi.gov.in directly — don't trust a link the advisor sends you.",
};

const STATUS_TRACKING: ComplaintChannel = {
  name: "Check Complaint Status",
  type: "portal",
  value: "cybercrime.gov.in/Webform/chkackstatus.aspx",
  note: "Track your complaint using the acknowledgement number you got when filing.",
};

const SOCIAL_MEDIA_ABUSE: ComplaintChannel = {
  name: "Report to the Platform (Facebook/Instagram/etc.)",
  type: "portal",
  value: "cybercrime.gov.in/Webform/report_abuse_social_media.aspx",
  note: "Direct takedown request to the platform, in addition to your police complaint.",
};

const POLICE_EMERGENCY: ComplaintChannel = {
  name: "Police Emergency",
  type: "helpline",
  value: "112 / 100",
  note: "General police emergency lines, alongside the cyber crime helpline.",
};

// ---- Tree data ----

export const SCAM_TREE: ScamNode = {
  id: "root",
  title: "What happened?",
  shortLabel: "What happened?",
  summary: "Pick the category closest to what happened to you. You don't need to know the exact scam name — just start with what you experienced.",
  children: [
    {
      id: "cat-blackmail",
      title: "Blackmail, Extortion & Sextortion",
      shortLabel: "Blackmail / Extortion",
      summary: "Someone is threatening to share private photos, videos, or a recorded call unless you pay or comply.",
      children: [
        {
          id: "sextortion-video-call",
          title: "Blackmailed after a video call",
          shortLabel: "Video call blackmail",
          summary: "You were added on WhatsApp/Instagram/Telegram by a stranger, moved to a video call that turned sexual, it was screen-recorded without your knowledge, and now you're being threatened to pay or it'll be sent to your contacts/family/social media.",
          keywords: ["sextortion", "video call", "nude", "recorded", "whatsapp blackmail", "instagram blackmail", "honey trap"],
          detail: {
            verified: true,
            warningSigns: [
              "A stranger added you and escalated to video/intimacy unusually fast.",
              "The call ended abruptly, followed quickly by a screenshot or recording being sent to you.",
              "They already have your contact list, family names, or workplace — often scraped from your profile or the app's contact-sync permission.",
              "They ask for payment via UPI, crypto, or gift cards — and keep asking for more even after you pay.",
              "Some gangs run this from rented SIMs across multiple states — you are very unlikely to be the only target that day.",
            ],
            immediateSteps: [
              { title: "Stop paying, stop responding", detail: "Paying does not make it stop — it confirms you'll pay, and demands usually increase. Do not send any more money." },
              { title: "Do not delete anything", detail: "Don't delete the chat, the call, or the contact. Screenshots, chat history, and the number are your evidence." },
              { title: "Block only after you've saved evidence", detail: "If you block first, you may lose access to the chat and their profile details. Capture everything first." },
              { title: "Tell someone you trust", detail: "This is the hardest step but the most important one. You are the victim of a crime, not the person who did something wrong. Blackmailers rely on your silence — a private word to one trusted person (or directly to the police) removes their leverage." },
            ],
            evidenceToGather: [
              "Screenshots of the entire chat, including the initial contact/add request.",
              "The scammer's phone number, username, and profile screenshot (before blocking).",
              "Any UPI ID, bank account, or wallet number they've asked you to pay to.",
              "Screenshot of any payment you already made (UPI reference number / transaction ID).",
              "If possible, the app and platform used (WhatsApp, Instagram, Telegram, etc.) and approximate date/time of the call.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 immediately", detail: "Especially if you've already paid — this is time-sensitive for freezing the receiving account." },
              { title: "File on cybercrime.gov.in", detail: "Select \"Report Women/Children Related Crime\" → Category \"Online and Social Media Related Crimes\" → Sub-category \"Online Sextortion\". There's a \"Report Anonymously\" option if you want your identity kept private." },
              { title: "Report the profile on the platform", detail: "Report and block the account on WhatsApp/Instagram/Telegram after saving evidence — this can help stop them reaching new victims." },
              { title: "Ask about confidentiality", detail: "When you file, you can request that your complaint be handled discreetly. Cyber cells in most cities have experience with these cases and won't publicize your identity." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, WOMEN_HELPLINE, SOCIAL_MEDIA_ABUSE, NCW_PORTAL, CHILDLINE, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "In a Delhi Shahdara case, two men from Rajasthan extorted ₹12.8 lakh from an elderly Delhi resident using exactly this WhatsApp video-call screenshot threat. A related gang bust recovered 140 victim videos from just 8 phones — showing how many people are targeted by the same operation.",
              source: "Reported by The Tribune",
            },
          },
        },
        {
          id: "morphed-photo-blackmail",
          title: "Threatened with a fake or morphed photo/video",
          shortLabel: "Morphed photo blackmail",
          summary: "Someone has edited your photo (from social media) onto explicit content, or is threatening to circulate a fake/doctored image or video of you unless you pay or comply.",
          keywords: ["morphed photo", "deepfake", "fake nude", "photoshopped", "edited picture blackmail"],
          detail: {
            verified: false,
            warningSigns: [
              "The photo used is one that's publicly visible on your social media (profile picture, tagged photo).",
              "They send a 'preview' or partial version as proof and ask for payment before sending the 'full' one anywhere.",
              "The threat is to send it to your family, employer, or post it publicly / on a website.",
            ],
            immediateSteps: [
              { title: "Do not pay", detail: "Morphed content can be reported and taken down through legal channels — paying doesn't guarantee it stops." },
              { title: "Preserve everything", detail: "Screenshot the threat, the image/video sent, the account details, and any payment demand, before blocking." },
              { title: "Tighten your social media privacy", detail: "Set profiles to private and remove public photos where possible to reduce material available for further edits." },
            ],
            evidenceToGather: [
              "The morphed image/video itself (screenshot or saved file).",
              "Screenshots of the threat messages and the account/profile making them.",
              "The original, unedited photo they used, if you can identify it.",
              "Any payment details demanded.",
            ],
            howToFile: [
              { title: "File on cybercrime.gov.in", detail: "This falls under morphing / obscene material — a specific reportable category on the portal." },
              { title: "Call 1930", detail: "For guidance and to flag the threat, especially if payment has already been demanded with a deadline." },
              { title: "Request platform takedown", detail: "Instagram, Facebook, and X all have dedicated forms for reporting impersonation and non-consensual imagery, separate from the police complaint." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, WOMEN_HELPLINE, NCW_PORTAL, LOCAL_CYBER_CELL],
          },
        },
        {
          id: "linkedin-honeytrap-blackmail",
          title: "A LinkedIn contact turned romantic/personal, then blackmail or a malware file",
          shortLabel: "LinkedIn honey trap",
          summary: "Someone posing as a recruiter, photographer, or industry peer connected with you on LinkedIn, moved the chat to WhatsApp/Facebook, and built a personal rapport — then either pushed you to open a shared document or escalated to a video call that turned compromising, and is now using it to blackmail you or extract confidential work information.",
          keywords: ["linkedin scam", "honey trap", "corporate espionage", "malware document", "linkedin blackmail"],
          detail: {
            verified: true,
            warningSigns: [
              "An unusually attractive or flattering profile reached out and pushed to move off LinkedIn to WhatsApp/Facebook quickly.",
              "They show unusual curiosity about your work, access privileges, or projects, alongside the personal/romantic angle.",
              "You were asked to open a shared document, resume, or 'portfolio' file from someone you just connected with.",
              "The relationship escalated to video calls with sexual content unusually fast, similar to other honey-trap patterns.",
            ],
            immediateSteps: [
              { title: "Don't pay or comply", detail: "Blackmail demands escalate once you show you'll pay or hand over information — refusing and reporting is safer than complying." },
              { title: "Disconnect and scan your device", detail: "If you opened any file they sent, disconnect from the network and have IT/security check for malware immediately." },
              { title: "Preserve the conversation", detail: "Screenshot the profile, chat history, and any files or call recordings before blocking." },
              { title: "Loop in your employer's security team", detail: "If you work in a technical, defence-adjacent, or government role, this may be a targeted espionage attempt, not just a personal scam — your organization's security/intelligence channel needs to know." },
            ],
            evidenceToGather: [
              "Screenshots of the LinkedIn profile, connection request, and full chat history across platforms.",
              "Any file, document, or link they sent you.",
              "Screenshots or recordings of any video call content used for blackmail.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 and file on cybercrime.gov.in", detail: "Category \"Other Cybercrime\" — describe the LinkedIn contact, the platform migration, and the blackmail or malware attempt." },
              { title: "Report the profile on LinkedIn", detail: "LinkedIn has dedicated reporting for fake/impersonation profiles used for social engineering." },
              { title: "Use internal security channels if applicable", detail: "Defence, government, or corporate-security-cleared employees should also report through their organization's internal security or intelligence channel, in addition to the police complaint." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "This mirrors the real 'Mia Ash' operation, where an elaborate fake photographer persona targeted technical and project-management professionals worldwide, including in India — a Deloitte cybersecurity employee opened a malware-laced Excel file after being contacted this way on LinkedIn. A 2025 Karnataka probe into a honey-trapping racket reportedly implicated dozens of officials.",
              source: "Reported by RegTech Times",
            },
          },
        },
        {
          id: "revenge-porn-stub",
          title: "Private photos shared by an ex-partner",
          shortLabel: "Ex shared private photos",
          summary: "Guide coming soon.",
          comingSoon: true,
        },
      ],
    },
    {
      id: "cat-impersonation",
      title: "Impersonation & Fear Scams",
      shortLabel: "Impersonation / Fear",
      summary: "Someone pretending to be police, a government official, courier company, or bank to scare you into paying or sharing information.",
      children: [
        {
          id: "digital-arrest-scam",
          title: "A 'police officer' or 'CBI/Customs official' on video call said I'm under arrest",
          shortLabel: "Digital arrest scam",
          summary: "You received a call claiming a parcel/courier in your name contains drugs or illegal items, or that you're linked to a crime. It escalated to a video call with people in uniform, threatening arrest unless you stay 'under digital surveillance' and transfer money for 'verification'.",
          keywords: ["digital arrest", "fake police", "cbi scam", "courier scam", "fedex scam", "customs scam", "trai scam"],
          detail: {
            verified: true,
            warningSigns: [
              "No real police, court, or government agency ever conducts an 'arrest' or investigation over a video call.",
              "You're told to stay on camera continuously and not tell anyone, isolating you from advice.",
              "You're pressured to transfer money urgently to a personal or 'verification' bank account — real agencies never ask for money transfers to individual accounts.",
              "Fake ID cards, seals, or a staged 'police station' background are used to look official.",
              "The caller already has some of your real details (Aadhaar number, bank name) — this doesn't make them legitimate, it means your data was leaked or bought elsewhere.",
            ],
            immediateSteps: [
              { title: "Hang up / end the call", detail: "There is no such thing as a 'digital arrest' in Indian law. This is 100% a scam — you are free to disconnect immediately." },
              { title: "Do not transfer any money", detail: "If a transfer is in progress, try to cancel or contact your bank immediately to stop it." },
              { title: "Do not share OTPs, Aadhaar, or bank details", detail: "No investigation requires you to share these over a call." },
              { title: "Verify independently", detail: "If worried, call your local police station directly using a number you look up yourself — not one given by the caller." },
            ],
            evidenceToGather: [
              "The phone number(s) that called you.",
              "Screen recording or screenshots of the video call if you managed to take any.",
              "Any fake documents, ID cards, or 'notices' they sent you (PDF/image).",
              "Bank account/UPI details they asked you to transfer to.",
              "Transaction ID/UTR number if you already paid.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 immediately", detail: "This is critical if money was transferred — speed matters for freezing the account." },
              { title: "File on cybercrime.gov.in", detail: "Category \"Other Cybercrime\" → Sub-category \"Impersonation and Identity Theft\". Under \"Where did the incident occur?\" pick the app used (WhatsApp, Skype, etc.), and describe how the suspect posed as police/CBI/NCB to extort money." },
              { title: "Inform your bank", detail: "Call your bank's fraud helpline in parallel to request a hold on the transaction." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "A monk in Karnataka lost ₹25 lakh of ashram funds after being kept on a fake 'digital arrest' video call for 25 days. Nationally, over 30,000 digital-arrest complaints were filed in a single year, with losses estimated near ₹3,000 crore — Mumbai alone lost ₹155 crore, up 33% year-on-year.",
              source: "Reported by Bloomberg",
            },
          },
        },
        {
          id: "fake-customer-care",
          title: "Called a 'customer care' number found on Google and lost money",
          shortLabel: "Fake customer care",
          summary: "You searched for a bank, airline, delivery, or wallet company's customer care number, called the number shown, and the person guided you to install a remote-access app or share an OTP/UPI PIN — after which money left your account.",
          keywords: ["fake customer care", "remote access app", "anydesk scam", "refund scam", "google search scam"],
          detail: {
            verified: true,
            warningSigns: [
              "The number was found via a Google search or a comment on social media, not the company's official app or card.",
              "You were asked to install AnyDesk, TeamViewer, or a similar remote-access app 'to process a refund'.",
              "You were asked to share an OTP, UPI PIN, or CVV — no genuine customer support ever needs these.",
              "A small 'refund' request (e.g. Re. 1) was used to get you to enter your UPI PIN, which actually authorizes an outgoing payment.",
              "The caller wants you to read out the access code shown on a remote-access app — that code is what lets them take control of your device.",
            ],
            immediateSteps: [
              { title: "Uninstall any remote-access app immediately", detail: "Remove AnyDesk/TeamViewer/QuickSupport and restart your phone." },
              { title: "Call your bank's fraud helpline now", detail: "Ask them to block your card/UPI and flag the account for suspicious activity." },
              { title: "Change your UPI PIN and net-banking password", detail: "Do this from a different, trusted device if possible." },
            ],
            evidenceToGather: [
              "The phone number you called and where you found it (screenshot of the search result).",
              "Call recording if your phone has one.",
              "Screenshot of the transaction(s) and UTR/reference number.",
              "Name of any app you were told to install.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 immediately", detail: "Time-sensitive — the faster this is reported, the higher the chance of freezing the money before withdrawal." },
              { title: "File on cybercrime.gov.in", detail: "Category \"Online Financial Fraud\" → Sub-category \"Fraud Call/Vishing\". Mention the search query that surfaced the fake number and the name of any remote-access app installed." },
              { title: "Raise a dispute with your bank", detail: "Most banks require a police complaint or acknowledgement number to process a fraud dispute — the 1930/portal complaint gives you that." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "A Delhi woman lost ₹85,000 after installing AnyDesk believing she was receiving an Amazon refund; a Mumbai businessman lost ₹1.8 lakh after a caller claiming to be from RBI convinced him the app was needed for 'account verification'.",
              source: "Reported via Moneylife",
            },
          },
        },
        {
          id: "courier-parcel-digital-arrest",
          title: "A 'courier company' or 'customs' call about drugs/passport in a parcel escalated to a fake police video call",
          shortLabel: "Courier → digital arrest",
          summary: "You got a call or message claiming a parcel addressed to you (often linked to your Aadhaar) contains drugs, a fake passport, or other contraband. The call escalated to a video call with someone posing as police/customs/CBI, who declared you under 'digital arrest' and pressured you to keep it secret and transfer money to prove your innocence.",
          keywords: ["courier scam", "fedex scam", "customs scam", "parcel scam", "digital arrest", "cbi scam", "drugs parcel scam"],
          detail: {
            verified: true,
            warningSigns: [
              "Courier companies never call about 'illegal contents' or connect you to police/customs over the phone — this is not how customs seizures are actually handled.",
              "You're transferred mid-call to a 'police' or 'customs officer' who appears over video in a uniform or staged office.",
              "You're told to keep the call secret from family and not hang up, sometimes for hours or days.",
              "Fake FIR numbers, employee IDs, or forged warrants are shown on screen or sent as documents to look official.",
              "You're pressured to share Aadhaar/bank details or transfer money 'to prove your account isn't linked to a crime'.",
            ],
            immediateSteps: [
              { title: "Hang up — do not stay on the call", detail: "There is no such thing as a legitimate 'digital arrest'. No Indian agency investigates or detains you over a video call." },
              { title: "Do not transfer any money", detail: "If a transfer is already underway, contact your bank immediately to try to stop or reverse it." },
              { title: "Verify the parcel claim independently", detail: "Contact the courier company only through its official app or website, never a number or link the caller gave you." },
              { title: "Tell your family immediately", detail: "Isolation and secrecy are the scam's main weapon — breaking the secrecy by telling someone removes their leverage." },
            ],
            evidenceToGather: [
              "The phone number(s) that called and any WhatsApp/video-call screenshots.",
              "Screenshots of any fake ID cards, FIR numbers, warrants, or 'documents' shown to you.",
              "Bank/UPI details you were asked to transfer to, and transaction IDs if you already paid.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 immediately", detail: "Time-sensitive if any money has already moved — faster reports improve the chance of freezing the receiving account." },
              { title: "File on cybercrime.gov.in", detail: "Category \"Other Cybercrime\" → Sub-category \"Impersonation and Identity Theft\". Describe the courier/customs pretext and how it escalated to a fake police video call." },
              { title: "File a local police FIR", detail: "Given how large these losses typically are, a physical FIR at your local cyber cell helps with bank disputes and investigation." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "Uttarakhand's STF busted a FedEx-impersonation digital-arrest racket built on exactly this pretext. In a separate case, a Pune-based IT professional was defrauded of ₹27.9 lakh across 10 transactions after fraudsters posing as Mumbai Police Cyber Crime officers claimed narcotics and a fake passport were found in a parcel addressed to him. Most tragically, an elderly couple in Karnataka died by suicide in March 2025 after being defrauded of ₹50 lakh through this exact scam.",
              source: "Reported by the420.in and multiple Indian news outlets",
            },
          },
        },
        {
          id: "fake-ed-court-scam",
          title: "A fake 'ED/Income Tax officer' or 'judge' held a video hearing and demanded money",
          shortLabel: "Fake ED / court scam",
          summary: "Someone claiming to be from the Enforcement Directorate, Income Tax Department, or a court contacted you about a money-laundering or tax case, then staged an elaborate fake 'hearing' over video call — sometimes with a fake lawyer or judge — pressuring you to transfer money to avoid arrest or asset seizure.",
          keywords: ["ed scam", "income tax scam", "fake court", "fake judge", "money laundering scam", "virtual courtroom scam"],
          detail: {
            verified: true,
            warningSigns: [
              "A real ED/Income Tax investigation is never conducted entirely over WhatsApp or Skype video call.",
              "A fake 'lawyer' or 'judge' appears in the same call, pushing you to pay quickly to avoid conviction.",
              "The contact card or documents use a real, identifiable official's name or photo to look credible — real officials do not confirm cases this way.",
              "There's no physical summons, no verifiable case number on the official court/ED website, and no way to independently verify the proceeding.",
              "You're pressured to transfer funds to a 'government verification account' to prove your innocence.",
            ],
            immediateSteps: [
              { title: "End the call — do not transfer money", detail: "No Indian court or the ED conducts trials or demands payment over a video call." },
              { title: "Verify independently", detail: "Check any claimed case on the official e-Courts portal (ecourts.gov.in) or the ED's official contact channels — not through numbers or links the caller gave you." },
              { title: "Insist on your own lawyer", detail: "If you're worried a real complaint might exist, engage a lawyer you've independently chosen, not one introduced to you on the same call." },
            ],
            evidenceToGather: [
              "Screenshots or recordings of the video call, including any fake documents or contact cards shown.",
              "The phone number(s)/handles used to contact you.",
              "Transaction details if any money was already transferred.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 and file on cybercrime.gov.in", detail: "Category \"Other Cybercrime\" → Sub-category \"Impersonation and Identity Theft\". Describe the fake ED/Income Tax/court proceeding in detail." },
              { title: "Report to the local police station", detail: "Ask for an FIR — this is treated as extortion and impersonation of a public servant, both criminal offences." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "A Bhopal-based engineer was duped of ₹36 lakh through a fake Supreme Court hearing and a staged ED investigation, complete with a fake 'lawyer' who was actually a gang member. In another case, a woman doctor was subjected to a fake 'trial' by a man calling himself 'Judge Dhananjay', whose contact card displayed a photo of a real sitting Chief Justice of India — and a 76-year-old Bengaluru man lost ₹16.24 lakh to a fake WhatsApp 'court hearing' posing as the Mumbai Crime Branch.",
              source: "Reported by the420.in",
            },
          },
        },
        {
          id: "trai-disconnection-scam",
          title: "A call or recorded message said my SIM/number will be disconnected over 'KYC' or a criminal case",
          shortLabel: "Fake TRAI / SIM disconnection",
          summary: "You received a call or automated message claiming to be from TRAI, saying your mobile number will be disconnected due to 'KYC non-compliance' or being linked to criminal complaints. Pressing a number to 'resolve it' connects you to a fake police/CBI officer, who moves into the standard digital-arrest script.",
          keywords: ["trai scam", "sim disconnection scam", "kyc scam", "mobile number scam", "press 9 scam"],
          detail: {
            verified: true,
            warningSigns: [
              "TRAI does not call individual subscribers about SIM disconnection or KYC — that only happens through your telecom operator's official SMS or app.",
              "You're asked to 'press 9' or a similar key to speak to an 'officer' — this is the transfer point into a fake police/CBI call.",
              "The message claims your number is linked to a specific number of 'criminal complaints' to sound authoritative and urgent.",
              "The call escalates into the same digital-arrest pattern: video call, uniforms, threats, demands for money.",
            ],
            immediateSteps: [
              { title: "Hang up — don't press any key", detail: "Pressing a number to 'resolve' the issue is exactly how the call routes you to the next stage of the scam." },
              { title: "Check your number's status yourself", detail: "Use your telecom provider's official app or website to confirm your KYC/SIM status independently." },
              { title: "Don't share any information", detail: "No details, OTPs, or personal information are needed to 'save' your number from disconnection." },
            ],
            evidenceToGather: [
              "The number that called or texted you, and a recording/screenshot of the message if possible.",
              "Details of anything said if the call was escalated to a fake officer.",
            ],
            howToFile: [
              { title: "Report to 1930 / cybercrime.gov.in", detail: "Category \"Other Cybercrime\" → Sub-category \"Impersonation and Identity Theft\". Mention TRAI impersonation specifically." },
              { title: "Report the number to your telecom provider", detail: "Most telecom apps have a spam/fraud-reporting option for such calls." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, STATUS_TRACKING],
            realCase: {
              summary: "TRAI has publicly flagged a rise in frauds using its name and has begun inserting warning messages on calls to raise awareness. In one documented case, a victim was told their number would be suspended over '22 criminal complaints', then transferred to a caller posing as a CBI officer alleging involvement in the Jet Airways collapse case.",
              source: "Reported by storyboard18.com",
            },
          },
        },
        {
          id: "sim-swap-stub",
          title: "Suddenly lost mobile network / SIM stopped working, then money left my account",
          shortLabel: "SIM swap fraud",
          summary: "Your phone suddenly showed 'No Service' for no reason, and around the same time money moved out of your bank or investment accounts — even though you didn't share an OTP. Fraudsters likely used your leaked personal details to get a duplicate SIM issued in your name, giving them your OTPs and account-recovery messages.",
          keywords: ["sim swap", "no network fraud", "otp less fraud", "account debited without otp", "duplicate sim fraud", "sim card fraud"],
          detail: {
            verified: true,
            warningSigns: [
              "Your phone suddenly loses network/signal for hours with no explanation — this can mean a duplicate SIM has been activated elsewhere.",
              "You get an SMS/email about a SIM deactivation or re-issue that you didn't request.",
              "You see password-reset or login alerts for accounts you didn't try to access.",
              "Money moves out of your bank/investment accounts without you entering an OTP yourself.",
            ],
            immediateSteps: [
              { title: "Contact your telecom provider immediately", detail: "Ask them to block the duplicate SIM and restore your number — do this the moment you notice unexplained loss of signal." },
              { title: "Call your bank right away", detail: "Ask them to freeze your account/cards and check for unauthorized transactions." },
              { title: "Change passwords from a different device", detail: "Update net-banking and email passwords using a device that wasn't affected." },
            ],
            evidenceToGather: [
              "Screenshots of any SIM deactivation/reissue notifications.",
              "Bank statements showing the unauthorized transactions, with UTR/reference numbers.",
              "Timeline of when the network loss started versus when the transactions occurred.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 immediately", detail: "This is highly time-sensitive — the faster it's reported, the better the chance of freezing the receiving account." },
              { title: "File on cybercrime.gov.in", detail: "Category \"Online Financial Fraud\" — describe the sudden loss of network followed by unauthorized transactions, and attach the telecom's SIM-reissue confirmation if you can get it." },
              { title: "File a police FIR", detail: "SIM swap losses are often large — an FIR helps with bank disputes and telecom-side investigation." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "A Mumbai-based steel-trading company owner lost ₹7.5 crore to SIM swap fraud (police later recovered ₹4.65 crore). A separate forensic case documented ₹1.19 crore in unauthorized transfers after a duplicate SIM was issued using a manipulated email that bypassed the telecom's identity checks.",
              source: "Reported by Business Standard",
            },
          },
        },
      ],
    },
    {
      id: "cat-financial",
      title: "Financial & Payment Fraud",
      shortLabel: "Payment / UPI Fraud",
      summary: "Money was deducted through UPI, a QR code, or you're being harassed over a loan app.",
      children: [
        {
          id: "upi-qr-fraud",
          title: "Scanned a QR code or accepted a request and money got deducted",
          shortLabel: "UPI / QR code fraud",
          summary: "While trying to receive money (e.g. selling something on OLX/Facebook Marketplace), you scanned a QR code or approved a 'collect request' on your UPI app — and instead of receiving money, money left your account.",
          keywords: ["upi fraud", "qr code scam", "olx scam", "collect request", "payment fraud"],
          detail: {
            verified: true,
            warningSigns: [
              "Remember: scanning a QR code or entering a UPI PIN is only ever needed to SEND money, never to receive it.",
              "A 'buyer' insists on paying via QR code or a 'collect request' notification instead of a normal direct transfer.",
              "You're pressured to act fast ('I'm about to board a flight', 'my army posting is urgent') — common on OLX/Marketplace scams.",
              "A small 'test' amount is scanned first to build trust before the real, larger fraudulent request.",
            ],
            immediateSteps: [
              { title: "Do not scan any more codes or approve requests from this person", detail: "Stop the interaction immediately." },
              { title: "Check your UPI app for the transaction", detail: "Note the UTR/reference number of the deducted amount." },
              { title: "Contact your bank's fraud helpline", detail: "Ask if the receiving account can be flagged/frozen." },
            ],
            evidenceToGather: [
              "Screenshot of the chat/listing (OLX, Marketplace, etc.) with the buyer/seller.",
              "Their phone number and any UPI ID shown.",
              "Transaction ID / UTR number and screenshot of the debit.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 as fast as possible", detail: "This is the single most time-sensitive scam type — funds often move out of the receiving account within hours." },
              { title: "File on cybercrime.gov.in", detail: "Category \"Online Financial Fraud\" → Sub-category \"UPI Related Frauds\". Enter the bank name, account number, 12-digit UTR/transaction ID, date and amount, and write at least 200 characters describing what happened." },
              { title: "Also report the listing", detail: "Report the buyer/seller profile on OLX/Facebook Marketplace so the account gets flagged." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, POLICE_EMERGENCY, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "A professor lost ₹63,000 instantly after being asked to scan a QR code to 'receive' a payment. In another case, a scammer baited the victim with a small ₹5 QR code first before a ₹5,200 QR code led to an actual debit of ₹5,200 — building false confidence before the real theft.",
              source: "Reported via ScamDekho",
            },
          },
        },
        {
          id: "loan-app-harassment",
          title: "Took a loan from an app and now being threatened/harassed",
          shortLabel: "Loan app harassment",
          summary: "You took a small, fast loan from a mobile app (often with no paperwork). Now, even after paying or on a normal due date, you're being harassed with abusive calls, threats, or your contacts/photos are being used to shame you — often the interest/fees demanded are far above what was agreed.",
          keywords: ["loan app", "instant loan", "harassment", "morphed photo threat", "recovery agent threat"],
          detail: {
            verified: true,
            warningSigns: [
              "The app asked for contact list, gallery, and SMS permissions during installation — this is how they get material to harass you and your contacts.",
              "No formal loan agreement, RBI registration, or physical KYC process was involved.",
              "Recovery involves threats, morphed photos, or calls to your family/contacts rather than formal legal notices.",
              "The effective interest rate is far higher than what was disclosed at the time of taking the loan.",
            ],
            immediateSteps: [
              { title: "Stop engaging with threats directly", detail: "Do not respond to abuse with abuse — document it instead." },
              { title: "Revoke app permissions / uninstall", detail: "Go to phone settings and revoke contacts, storage, and SMS permissions from the app immediately, then uninstall it." },
              { title: "Warn close contacts", detail: "If you know your contacts may be messaged, a short heads-up ('please ignore messages/calls from a loan recovery number about me, I'm reporting it') reduces the scammer's leverage and protects your relationships." },
              { title: "You are not without rights", detail: "Illegal lending apps and abusive recovery tactics are themselves crimes — you can report them even if you did take the loan and have unpaid dues." },
            ],
            evidenceToGather: [
              "Name and screenshots of the loan app (including Play Store/App Store listing if still available).",
              "Screenshots of all threatening calls/messages, and calls to your contacts if reported to you.",
              "Loan amount disbursed vs. amount demanded, with dates.",
              "Any morphed images or messages sent to your contacts.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Report on the RBI Sachet Portal", detail: "Specifically for illegal/unregistered digital lending apps and predatory recovery practices." },
              { title: "Call 1930 and file on cybercrime.gov.in", detail: "Category \"Other Cybercrime\" → Sub-category \"Cyber Bullying\". Select \"Mobile App\" as the location, describe the unauthorized contact access and any morphed photos, and log any \"processing fees\"/repayments under \"Lost Money\"." },
              { title: "Report the app to the app store", detail: "Google Play and Apple App Store both have policies against apps that harvest contacts for harassment — report the listing directly." },
            ],
            channels: [RBI_SACHET, CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
          },
        },
        {
          id: "vishing-otp-scam",
          title: "'Bank customer care' called, asked questions, then got me to share an OTP",
          shortLabel: "Vishing / fake bank call",
          summary: "Someone called claiming to be from your bank or a company's customer care — sometimes already knowing some of your real details — about a transaction or refund issue, and talked you into sharing an OTP, PIN, or CVV, after which money was withdrawn from your account.",
          keywords: ["vishing", "fake bank call", "otp scam", "bank customer care scam", "phone call fraud"],
          detail: {
            verified: true,
            warningSigns: [
              "Anyone asking for your OTP, PIN, or CVV over a call — banks never ask for these, full stop.",
              "The caller already knows some of your real personal details — this doesn't prove they're genuine, it usually means your data was leaked elsewhere.",
              "Urgency and fear tactics: 'your account will be blocked in 10 minutes' or similar.",
              "You're asked to install an app to 'process a refund' or 'complete verification'.",
            ],
            immediateSteps: [
              { title: "Call your bank immediately", detail: "Use the number on your card or bank's official app/website — not any number given during the call — and ask them to block your card/account." },
              { title: "Do not share any more information", detail: "If you already shared an OTP, assume the transaction has gone through and act on freezing the account, not preventing that one transaction." },
              { title: "Escalate to the RBI Ombudsman if the bank doesn't act", detail: "If your bank is slow to help, you can escalate through the RBI's grievance/ombudsman process using your written complaint." },
            ],
            evidenceToGather: [
              "The phone number that called you.",
              "Any details the caller already knew about you (useful for arguing bank liability in disputes).",
              "Screenshot of the transaction and UTR/reference number.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 immediately", detail: "Time-sensitive — faster reporting improves the odds of freezing the receiving account." },
              { title: "File on cybercrime.gov.in", detail: "Category \"Online Financial Fraud\" → Sub-category \"Fraud Call/Vishing\". Include the bank name, transaction ID, and what the caller told you." },
              { title: "File a written complaint with your bank", detail: "Courts have upheld bank liability in some vishing cases — a written complaint referencing the RBI's 2025 advisory on voice-call/SMS fraud strengthens your dispute." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "In State Bank of India v. Pallabh Bhowmick & Ors. (Jan 2025), the Supreme Court upheld the bank's liability after a customer was deceived by a fake customer-care call into downloading an app that led to unauthorized withdrawals — a precedent that strengthens victims' disputes with their own bank. The RBI has since issued a direct advisory (Circular RBI/2024-25/105) on preventing fraud via voice calls and SMS.",
              source: "Supreme Court ruling, reported via federal.bank.in",
            },
          },
        },
        {
          id: "phishing-kyc-scam",
          title: "An SMS/WhatsApp said my bank account will be blocked unless I 'update KYC' via a link",
          shortLabel: "Fake KYC phishing link",
          summary: "You got a message threatening account suspension unless you 'update your KYC' by clicking a link. The link led to a fake bank website or a cloned app that looked almost identical to the real one, and entering your details there handed your net-banking credentials and OTP straight to the scammer.",
          keywords: ["kyc scam", "phishing link", "fake bank app", "fake yono app", "sms scam", "bank link scam"],
          detail: {
            verified: true,
            warningSigns: [
              "Urgent, threatening language: 'your account will be blocked today'.",
              "The SMS comes from a random 10-digit number instead of your bank's registered sender ID.",
              "The link opens a site that looks almost identical to your bank's site or app, but the domain is subtly different.",
              "You're asked to enter net-banking credentials, OTP, or install an APK file through the link.",
            ],
            immediateSteps: [
              { title: "Don't click the link", detail: "If you haven't clicked it yet, delete the message. Type your bank's official URL manually or use its official app instead." },
              { title: "If you already entered details, act immediately", detail: "Call your bank right away to freeze net-banking access and change your passwords from an unaffected device." },
              { title: "Uninstall any app you installed via the link", detail: "Fake cloned banking apps are used to harvest credentials continuously — remove it immediately." },
            ],
            evidenceToGather: [
              "Screenshot of the SMS/WhatsApp message and the sender's number.",
              "The fake URL or app name, if you can still access it safely.",
              "Screenshot of any unauthorized transactions and their UTR/reference numbers.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 immediately", detail: "Especially urgent if credentials were already entered or money has moved." },
              { title: "File on cybercrime.gov.in", detail: "Category \"Online Financial Fraud\" → Sub-category \"Internet Banking Related Fraud\". Attach the phishing SMS and any fake app details." },
              { title: "Inform your bank", detail: "Ask them to flag the account and check for further unauthorized access attempts." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "Delhi Police busted a pan-India gang that used bulk fake-SBI SMS messages and a cloned fake 'YONO' app to loot over 8,000 victims. In a separate case, around 40 customers of a private Mumbai bank — including a well-known actress who lost ₹57,636 — fell victim to fake KYC/PAN-update SMS messages.",
              source: "Reported via Delhi Police and scamdekho.in",
            },
          },
        },
      ],
    },
    {
      id: "cat-opportunity",
      title: "Fake Opportunity Scams",
      shortLabel: "Job / Investment Scams",
      summary: "A job offer, task, or investment 'opportunity' that asked you to pay money upfront or keep depositing more.",
      children: [
        {
          id: "fake-job-offer",
          title: "Work-from-home job asked me to pay first, or do 'tasks'",
          shortLabel: "Fake job / task scam",
          summary: "You were offered an easy work-from-home job (often 'rate this product', 'like this video', or data entry) via WhatsApp/Telegram. Early small tasks paid out real money, building trust, then you were asked to deposit increasing amounts to 'unlock' bigger tasks or withdraw earnings — and now can't get your money back.",
          keywords: ["job scam", "task scam", "part time job fraud", "telegram job scam", "work from home scam"],
          detail: {
            verified: true,
            warningSigns: [
              "The 'job' was offered unsolicited via WhatsApp/Telegram message, not a real job platform.",
              "Early tasks pay out small real amounts quickly — this is designed to build trust before the real ask.",
              "At some point you're told to deposit your own money to 'unlock' higher-paying tasks, clear a 'negative balance', or enable withdrawal.",
              "There is no real company, HR contact, or verifiable office address.",
            ],
            immediateSteps: [
              { title: "Stop depositing money immediately", detail: "No legitimate job will ever ask you to pay to keep working or to withdraw your own earnings." },
              { title: "Do not chase 'unlocking' the withdrawal", detail: "This is designed to keep you paying more — the balance shown in the app is not real money." },
              { title: "Save the chat before it's deleted", detail: "These groups/accounts are often shut down and deleted quickly after the scam is exposed." },
            ],
            evidenceToGather: [
              "Full screenshots of the chat/group from the very first message.",
              "The app or website used, and any screenshots of the fake 'earnings' balance.",
              "All UPI IDs / bank accounts you were asked to deposit to, with transaction IDs.",
              "Any recruiter name, phone number, or profile photo used.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 immediately", detail: "Especially important if a payment was made recently — for freeze requests." },
              { title: "File on cybercrime.gov.in", detail: "Category \"Other Cybercrime\" → Sub-category \"Online Job Fraud\". Detail the task guidelines and how you were asked to pay to \"withdraw\" earnings, and log each transaction (UTR, date, amount)." },
              { title: "Report the group/channel", detail: "Report and leave the WhatsApp/Telegram group to prevent further exposure, after saving evidence." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
          },
        },
        {
          id: "investment-tip-scam",
          title: "Joined a Telegram/WhatsApp group promising guaranteed stock or crypto returns",
          shortLabel: "Investment / trading scam",
          summary: "You were added to a group run by a 'SEBI-registered advisor' or trading 'guru' promising guaranteed high returns. You were guided to invest through an unfamiliar app or website showing rising profits — but when you tried to withdraw, you were asked to pay more 'taxes' or 'fees', or the app simply stopped working.",
          keywords: ["investment scam", "trading app scam", "crypto scam", "stock tip scam", "guaranteed returns scam"],
          detail: {
            verified: true,
            warningSigns: [
              "'Guaranteed' or unusually high, consistent returns — real markets are never risk-free or guaranteed.",
              "Pressure to invest through a specific unfamiliar app/website rather than your own registered broker.",
              "Any SEBI registration number given is not independently verified by you on SEBI's own site.",
              "Withdrawal requires paying additional 'tax', 'fee', or 'unlock' amounts first.",
            ],
            immediateSteps: [
              { title: "Stop investing further", detail: "Do not pay any more 'fees' or 'taxes' to unlock a withdrawal — this is a common escalation tactic." },
              { title: "Try to withdraw whatever is possible immediately", detail: "If any withdrawal is still working, attempt it now rather than waiting." },
              { title: "Verify any advisor independently", detail: "Check SEBI registration numbers directly on SEBI's website, not via a link or screenshot the 'advisor' sent you." },
            ],
            evidenceToGather: [
              "Screenshots of the group, the advisor's messages, and any claims of guaranteed returns.",
              "The app/website name and screenshots of your 'portfolio' or balance shown.",
              "All payment transaction IDs and the accounts they were sent to.",
              "Any registration numbers or credentials claimed by the advisor.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 and file on cybercrime.gov.in", detail: "Category \"Online Financial Fraud\" → Sub-category \"Internet Banking Related Fraud\". Select \"WhatsApp Number/Telegram Handle\" as the incident location, and describe the guaranteed-return claims and any fake IPO/deepfake ads used." },
              { title: "File on SEBI SCORES", detail: "Especially if a fake SEBI registration or advisor identity was used." },
              { title: "Report the group/channel on the platform", detail: "After saving evidence, report it so fewer people are added." },
            ],
            channels: [SEBI_SCORES, CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "SEBI barred 7 individuals in a ₹20.25 crore social-media stock-manipulation case built on exactly this WhatsApp/Telegram tip-circulation pattern, and separately barred 221 entities while ordering recovery of nearly ₹144 crore in unlawful gains after search-and-seizure raids. Industry analysis estimates investment scams now account for the majority of all money lost to cyber fraud in India.",
              source: "Reported via SEBI orders and tejimandi.com",
            },
          },
        },
        {
          id: "fake-trading-app-scam",
          title: "A trading/crypto app showed rising profits, then blocked my withdrawal and demanded more fees",
          shortLabel: "Fake trading app scam",
          summary: "You were guided — often via WhatsApp, Instagram ads, or a finance 'influencer' — to install a trading or crypto app outside the regular app stores. It showed a professional dashboard with steadily rising profits, but when you tried to withdraw, it blocked the withdrawal and demanded more money as 'tax', 'currency exchange fee', or an 'unlocking' charge.",
          keywords: ["fake trading app", "forex scam", "blocked withdrawal scam", "crypto app scam", "influencer trading scam"],
          detail: {
            verified: true,
            warningSigns: [
              "The withdraw button is disabled or stuck 'processing' indefinitely.",
              "You're asked to pay extra 'tax', 'fee', or 'verification' charges before you can withdraw your own shown balance.",
              "The app isn't on the official Play Store/App Store — you were told to sideload it via an APK file.",
              "Profit screenshots and 'other investors' testimonials are shared inside a WhatsApp/Telegram group to build pressure and trust.",
              "It was promoted through an Instagram ad, YouTube influencer, or an unregistered offshore forex/crypto platform.",
            ],
            immediateSteps: [
              { title: "Stop paying any further 'fees'", detail: "Any request for more money to 'unlock' a withdrawal is itself confirmation this is a scam — the balance shown was never real." },
              { title: "Screenshot everything now", detail: "Capture the app's dashboard, balance, chat group, and any 'profit' claims before the group or app disappears." },
              { title: "Report to your bank immediately", detail: "Ask about freezing the transaction — recovery odds fall sharply the longer you wait." },
            ],
            evidenceToGather: [
              "The app name, where you downloaded it from, and screenshots of the dashboard/balance.",
              "All payment transaction IDs and the accounts/UPI IDs they were sent to.",
              "Any influencer post, ad, or Telegram/WhatsApp group used to recruit you.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Report to 1930 within hours if possible", detail: "Reported recovery rates fall from roughly 65% within the first 24 hours to about 12% after 30 days — speed matters a lot here." },
              { title: "File on cybercrime.gov.in", detail: "Category \"Online Financial Fraud\" → \"Internet Banking Related Fraud\" or \"Fraud Call/Vishing\" depending on how you were contacted; describe the fake app and blocked withdrawal in detail." },
              { title: "File on SEBI SCORES", detail: "If the platform claimed SEBI/exchange registration, report it there too so it can be investigated and flagged for others." },
              { title: "Report influencer ads to the platform and ASCI", detail: "If an Instagram/YouTube influencer promoted it, report the ad to the platform and to the Advertising Standards Council of India (ASCI)." },
            ],
            channels: [SEBI_SCORES, CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "A Hyderabad software engineer lost over ₹3.2 crore to a WhatsApp-run fake trading platform with fabricated profit screenshots. A Khammam businessman lost ₹2.05 crore after being told to pay ₹64 lakh in 'income tax' and then ₹34.28 lakh in 'currency exchange fees' just to withdraw his shown balance. Delhi Police separately uncovered a ₹100 crore scheme affecting over 600 victims nationally, and an Ahmedabad medical representative lost ₹44 lakh after an Instagram ad and Telegram 'signals' group.",
              source: "Reported via the420.in and fastbull.com",
            },
          },
        },
        {
          id: "crypto-ponzi-scam",
          title: "Joined a scheme promising to 'double' my money or guaranteed crypto returns",
          shortLabel: "Crypto Ponzi / doubling scam",
          summary: "You were promised your investment would double, or that a crypto 'cloud mining' or MLM scheme would pay guaranteed high returns. Early payouts (often funded by newer investors' money) built your confidence, but the scheme eventually stopped paying or vanished entirely.",
          keywords: ["crypto ponzi", "doubling scheme", "mlm scam", "cloud mining scam", "guaranteed returns scam"],
          detail: {
            verified: true,
            warningSigns: [
              "Any promise to 'double' your money or pay a guaranteed fixed return — no legitimate investment can guarantee this.",
              "The scheme has a multi-level/referral structure paying you a bonus for recruiting friends and family.",
              "There's no real underlying business — returns come only from new investors' money.",
              "The platform isn't registered with any recognized financial regulator.",
            ],
            immediateSteps: [
              { title: "Stop investing more and try to withdraw immediately", detail: "If any withdrawal still works, attempt it now rather than waiting or investing further to 'unlock' it." },
              { title: "Don't recruit others", detail: "Bringing in friends or family to recover your own losses only spreads the harm further." },
              { title: "Preserve every transaction record", detail: "Screenshots of the app/website, chat groups, and all payment references." },
            ],
            evidenceToGather: [
              "The platform/app name and any registration claims it made.",
              "All transaction IDs and the wallet/UPI addresses money was sent to.",
              "Screenshots of the recruitment chat, referral structure, or MLM materials.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Report to 1930 / cybercrime.gov.in immediately", detail: "Category \"Online Financial Fraud\". Describe the doubling/guaranteed-return promise and the MLM/referral structure if any." },
              { title: "File at your local cyber cell too", detail: "Large Ponzi schemes are often also investigated by the ED/CBI for money laundering — a local FIR helps connect your case to any larger probe." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "The GainBitcoin Ponzi scheme alone defrauded over 100,000 investors of an estimated $2.1 billion before its mastermind was arrested at Mumbai airport while fleeing to Sri Lanka. A separate crypto Ponzi/MLM scheme with roughly $254 million in reported losses triggered Enforcement Directorate raids across eight locations in Himachal Pradesh and Punjab.",
              source: "Reported via beincrypto.com",
            },
          },
        },
        {
          id: "lottery-scam-stub",
          title: "WhatsApp message about winning a lottery or KBC prize",
          shortLabel: "Lottery / KBC scam",
          summary: "Guide coming soon.",
          comingSoon: true,
        },
      ],
    },
    {
      id: "cat-romance",
      title: "Romance & Relationship Scams",
      shortLabel: "Romance Scams",
      summary: "Someone you met online built a relationship with you over time, then asked for money, gifts, or investment help.",
      children: [
        {
          id: "online-romance-scam",
          title: "Someone I met online gained my trust, then asked for money",
          shortLabel: "Online romance scam",
          summary: "You met someone on a dating app, Instagram, or Facebook. Over weeks or months they built an emotional connection — often claiming to be abroad, in the military, or on an oil rig — then a 'crisis' came up (customs fee, medical emergency, stuck package) and they asked you for money, usually repeatedly.",
          keywords: ["romance scam", "dating app scam", "online love scam", "military scam", "gift scam"],
          detail: {
            verified: true,
            warningSigns: [
              "They avoid video calls or in-person meetings with excuses, or a video call feels oddly staged/short.",
              "They claim to be overseas — military deployment, oil rig, ship captain, or a foreign business trip are extremely common cover stories.",
              "Profile photos reverse-image-search to someone else, or the account is recently created with few genuine posts.",
              "A sudden 'emergency' requiring money arrives after the relationship feels established — customs fees on a 'gift', medical costs, or a stuck shipment.",
            ],
            immediateSteps: [
              { title: "Stop sending money", detail: "Once one payment is made, more 'emergencies' typically follow. Pause and verify independently before sending anything further." },
              { title: "Reverse image search their photos", detail: "Search their profile pictures online — stolen photos of real, unrelated people are common in these scams." },
              { title: "Talk to someone you trust", detail: "Romance scams work partly through isolation and embarrassment — sharing with a trusted friend or family member helps you see it clearly." },
            ],
            evidenceToGather: [
              "Full chat history/screenshots from the start of the conversation.",
              "Their profile screenshots, photos used, and any claimed name/identity/job.",
              "All payment details — amounts, dates, UPI/bank/wire transfer references.",
              "Any documents, ID, or 'proof' they sent to convince you.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 and file on cybercrime.gov.in", detail: "Category \"Other Cybercrime\" → Sub-category \"Online Matrimonial Fraud\". Specify the platform/app used, describe the relationship and the 'emergency' money requests, and log transaction details if any money was sent." },
              { title: "Report the profile on the platform", detail: "Dating apps and social platforms have dedicated reporting for fake/romance-scam profiles." },
              { title: "If money was wired internationally", detail: "Also contact your bank immediately — international wire recalls are time-sensitive and harder to reverse than UPI." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "A Gurugram MNC professional lost ₹73.42 lakh after a Bumble match steered him into a fraudulent stock-trading Telegram group with fake investor testimonials. Separately, fake Bumble and Snapchat profiles were used in a Delhi case purely to obtain intimate photos and then blackmail victims — showing romance scams and sextortion often overlap.",
              source: "Reported via The Logical Indian",
            },
          },
        },
        {
          id: "army-romance-scam",
          title: "Someone claiming to be an Army/defence officer 'posted abroad' asked me for money",
          shortLabel: "Fake army officer romance scam",
          summary: "You've been talking to someone claiming to be an Army, Air Force, or Navy officer who is always 'on a mission' or 'posted abroad', which conveniently explains why they can never video call. After weeks of building a relationship, they've asked for money for leave travel, medical bills, equipment, or to release a gift stuck in customs.",
          keywords: ["fake army scam", "defence officer scam", "military romance scam", "fauji scam", "soldier romance scam"],
          detail: {
            verified: false,
            warningSigns: [
              "The 'officer' can never video call, always citing being 'on a mission' or 'at the border'.",
              "Requests for money tied to leave travel, medical emergencies, equipment, or releasing a 'stuck' gift/parcel.",
              "A poor or inconsistent grasp of actual military ranks, postings, or terminology for someone claiming that career.",
              "Profile photos that reverse-image-search to a different, real person online.",
            ],
            immediateSteps: [
              { title: "Stop sending money", detail: "No genuine military deployment requires a partner to fund leave travel, equipment, or customs release." },
              { title: "Verify their claimed identity through official channels", detail: "Genuine defence personnel and their postings can be verified through official military channels — not through documents the person themselves sends you." },
              { title: "Reverse image search their photos", detail: "Stolen photos of real, unrelated people (including real serving officers) are extremely common in this scam." },
            ],
            evidenceToGather: [
              "Full chat history and any photos/documents (ID cards, postings) they sent you.",
              "Screenshots of every money request and the account/UPI details used.",
              "Their claimed name, rank, and unit for verification.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Report to 1930 and cybercrime.gov.in", detail: "Category \"Other Cybercrime\" → Sub-category \"Online Matrimonial Fraud\" if met via a dating/matrimonial platform. Describe the claimed military identity and the money requests." },
              { title: "Report the profile to the platform", detail: "Dating and social media platforms have dedicated reporting for impersonation and romance-scam profiles." },
              { title: "Do not pay if sensitive photos were shared and blackmail follows", detail: "Treat any resulting blackmail as sextortion — report it, don't pay." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, WOMEN_HELPLINE, LOCAL_CYBER_CELL, STATUS_TRACKING],
          },
        },
        {
          id: "matrimonial-scam-stub",
          title: "A matrimonial site profile (often a 'settled NRI') turned out to be fake",
          shortLabel: "Matrimonial site scam",
          summary: "You connected with someone on a matrimonial site who claimed to be a well-settled NRI professional. After weeks of fast-moving emotional bonding and talk of marriage, they asked for money — for visa fees, a medical emergency, customs clearance on a gift, or an 'investment opportunity'.",
          keywords: ["matrimonial scam", "nri scam", "shaadi.com scam", "bharatmatrimony scam", "jeevansathi scam", "fake nri profile"],
          detail: {
            verified: true,
            warningSigns: [
              "They consistently avoid meeting in person or a live video call, citing time zones or being 'posted abroad'.",
              "Requests for money for customs/visa fees, a gift stuck at the airport, or medical bills.",
              "Marriage and emotional commitment talk moves unusually fast — within days or weeks.",
              "Documents (ID, employment proof) they share are inconsistent or can't be independently verified.",
            ],
            immediateSteps: [
              { title: "Stop all transfers immediately", detail: "No genuine relationship requires you to pay for someone else's visa, customs, or medical costs." },
              { title: "Insist on a live, spontaneous video call and an in-person meeting with family", detail: "Before any financial commitment, genuine matches will agree to this without excuses." },
              { title: "Verify their claimed employer/institution independently", detail: "Don't rely on documents or contacts the person themselves provides — verify through official channels." },
            ],
            evidenceToGather: [
              "Full chat history and any documents/photos they sent.",
              "All payment transaction records and the accounts they were sent to.",
              "Screenshots of their matrimonial profile before it's taken down.",
              "A copy of your ID proof (Aadhaar/PAN/Voter ID) — the portal requires this to submit the complaint.",
            ],
            howToFile: [
              { title: "Call 1930 and file on cybercrime.gov.in", detail: "Category \"Other Cybercrime\" → Sub-category \"Online Matrimonial Fraud\". Include the platform name and full transaction history." },
              { title: "Report the profile to the matrimonial platform", detail: "Shaadi.com, BharatMatrimony, and Jeevansathi all have fraud-reporting and profile-takedown processes." },
              { title: "Treat as sextortion if blackmail is involved", detail: "If intimate material was shared and is now being used to extort you, do not pay — report it as blackmail alongside the financial fraud." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, WOMEN_HELPLINE, LOCAL_CYBER_CELL, STATUS_TRACKING],
            realCase: {
              summary: "A Perth-based man was arrested by Pune Police for running a fake matrimonial profile that cheated one woman of ₹3.6 crore, after having messaged roughly 3,000 women. Separately, more than 10 women in Visakhapatnam lost a combined ₹20 lakh in 2025 to fake-NRI 'stuck gift' scams, and a Dehradun engineer lost ₹39.62 lakh in a combined matrimonial honey-trap and investment fraud.",
              source: "Reported by The Tribune",
            },
          },
        },
        {
          id: "customs-gift-scam",
          title: "An online friend/love interest is sending an expensive gift, and now I'm asked to pay 'customs duty'",
          shortLabel: "Fake customs duty / gift scam",
          summary: "Someone you met on social media, a dating app, or a matrimonial site says they're sending you an expensive gift or parcel from abroad. Soon after, you get a call or email demanding a 'customs duty' or clearance payment to a private bank account to release it — but the parcel never existed.",
          keywords: ["customs duty scam", "gift parcel scam", "cbic scam", "fake parcel scam", "international gift scam"],
          detail: {
            verified: false,
            warningSigns: [
              "Customs duty is never collected into a private or individual bank account — only through nominated banks in favor of the Commissioner of Customs.",
              "Genuine customs communication has a verifiable Document Identification Number (DIN) you can check on the CBIC website — most scam calls/emails don't, or give a fake one.",
              "Claims of 'cash hidden inside the parcel' are themselves suspicious — mailing cash/currency internationally is illegal.",
              "The relationship or 'gift' promise developed entirely online, often with someone you've never met in person.",
            ],
            immediateSteps: [
              { title: "Do not pay", detail: "No genuine customs duty is ever collected this way — treat any such demand as confirmation of a scam." },
              { title: "Verify directly with CBIC", detail: "Check any Document Identification Number (DIN) on the official CBIC website, or call the customs helpline directly, before considering any payment as genuine." },
              { title: "Be skeptical of the 'gift' relationship itself", detail: "If this developed through an online-only relationship, treat the entire interaction as a likely scam, not just the customs demand." },
            ],
            evidenceToGather: [
              "The message/call demanding payment and any claimed DIN or customs reference number.",
              "The bank account or UPI ID you were asked to pay.",
              "Chat history with the person who claimed to be sending the gift.",
            ],
            howToFile: [
              { title: "Do not pay, and report to 1930 / cybercrime.gov.in", detail: "Describe the online relationship, the claimed gift, and the customs payment demand." },
              { title: "Verify and report via the CBIC/customs helpline", detail: "CBIC has run public campaigns specifically warning against frauds committed in the name of Indian Customs." },
            ],
            channels: [CYBER_HELPLINE, CYBER_PORTAL, LOCAL_CYBER_CELL, STATUS_TRACKING],
          },
        },
      ],
    },
  ],
};

export function flattenNodes(node: ScamNode, path: ScamNode[] = []): { node: ScamNode; path: ScamNode[] }[] {
  const currentPath = [...path, node];
  const result = [{ node, path: currentPath }];
  if (node.children) {
    for (const child of node.children) {
      result.push(...flattenNodes(child, currentPath));
    }
  }
  return result;
}

export function findPathToNode(id: string): ScamNode[] | null {
  const all = flattenNodes(SCAM_TREE);
  const match = all.find((e) => e.node.id === id);
  return match ? match.path : null;
}

export function getNodeById(id: string): ScamNode | null {
  const all = flattenNodes(SCAM_TREE);
  const match = all.find((e) => e.node.id === id);
  return match ? match.node : null;
}

export function getAllLeaves(): { node: ScamNode; path: ScamNode[] }[] {
  return flattenNodes(SCAM_TREE).filter((e) => !e.node.children);
}

// ---- Admin content overrides (served by /api/content, edited from /?admin) ----
// Edits patch existing nodes by id; added nodes attach as children of a category.
// Applied once at startup (see main.tsx) before anything renders.

export interface ContentOverrides {
  edits: Record<string, Partial<ScamNode>>;
  added: { parentId: string; node: ScamNode }[];
}

export function applyOverrides(overrides: ContentOverrides): void {
  for (const [id, patch] of Object.entries(overrides.edits ?? {})) {
    const node = getNodeById(id);
    if (node) Object.assign(node, patch);
  }
  for (const { parentId, node } of overrides.added ?? []) {
    const parent = getNodeById(parentId);
    if (!parent || getNodeById(node.id)) continue;
    parent.children = parent.children ?? [];
    parent.children.push(node);
  }
}
