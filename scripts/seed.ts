/**
 * Loads the real church content (from the old WordPress site) into Payload.
 *
 *   Local:  pnpm seed
 *   Live:   pnpm seed:remote          (writes to the Cloudflare D1 database + R2 bucket)
 *
 * Refuses to run if content already exists, unless SEED_RESET=1 (which wipes content first; logins are kept).
 * Needs `node scripts/prepare-images.mjs` to have produced scripts/wp-export/optimized/.
 */
import fs from 'node:fs'
import path from 'node:path'

import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import config from '@payload-config'
import { getPayload, type CollectionSlug } from 'payload'

import { DEFAULT_NAVIGATION_DATA } from '../src/components/site/nav'

const IMG_DIR = path.resolve('scripts/wp-export/optimized')
const img = (original: string) => original.replace(/-scaled/, '').replace(/-e\d{10,}/, '').replace(/\.(jpe?g)$/i, '.webp')

// ---------------------------------------------------------------- photos
// file -> description (alt text). Grouped by album.
const WORSHIP: Record<string, string> = {
  'IMG_7858-scaled.jpg': 'Choir ministering in blue and gold robes',
  'IMG_7426-scaled.jpg': 'Choristers singing during worship',
  'untitled-75-of-114-scaled.jpg': 'Young choristers in procession',
  'untitled-5-of-114-scaled.jpg': 'Choir members leading praise',
  'IMG_9765-scaled.jpg': 'Choir singing at the altar',
  'IMG_9316-scaled.jpeg': 'Choir and congregation in worship',
  'IMG_9285-scaled.jpg': 'Youth choir members rejoicing',
  '2-scaled.jpg': 'Chorister singing during service',
  '19-scaled.jpg': 'Choir member smiling during worship',
  'IMG_7338-scaled-e1786220105395.jpg': 'Choir lined up for service',
  'untitled-50-of-114-scaled-e1786218818724.jpg': 'Young choir members in fellowship',
  '1N5A9960-scaled.jpeg': 'The choir leading praise and worship at CCC Erith Parish',
}
const THANKSGIVING: Record<string, string> = {
  'IMG_9746-scaled.jpg': 'Elders bringing thanksgiving offerings',
  'IMG_9148-scaled.jpg': 'Media team recording a service',
  '1N5A9942-scaled.jpeg': 'Members presenting gifts at the altar',
  '1N5A9931-scaled.jpeg': 'Women bringing offerings in procession',
  '1N5A0037-scaled.jpeg': 'Brethren with thanksgiving gifts',
  '1N5A9943-scaled.jpeg': 'Ministers presenting harvest offerings',
  '1N5A9996-scaled.jpeg': 'Young members with thanksgiving gifts',
  '1N5A0003-scaled.jpeg': 'Joyful thanksgiving procession',
  '1N5A0036-e1786219955255.jpeg': 'Members rejoicing with fruit offerings',
  'IMG_0504-scaled.jpeg': 'Congregation in prayer and thanksgiving',
  'IMG_0495-scaled.jpeg': 'Members gathered for service',
}
const FAMILY: Record<string, string> = {
  'untitled-18-of-114-scaled.jpg': 'Children of the parish in white garments',
  'IMG_7256-1-scaled.jpg': 'Women’s fellowship celebration',
  '1N5A9855-scaled.jpeg': 'Members during a celebration service',
  '1N5A0168-scaled.jpeg': 'Church family smiling together',
  '1N5A0058-scaled.jpeg': 'Congregation joining in procession',
  '1N5A0052-scaled.jpeg': 'Members of the ushering and hospitality team',
  '1N5A0022-scaled.jpeg': 'A full church on a celebration Sunday',
  '1N5A0187-scaled.jpeg': 'A mother and children at church',
  '1N5A0081-scaled.jpeg': 'Women’s fellowship group photo',
  '1N5A0019-scaled.jpeg': 'Women of the parish at a celebration',
  'IMG_4625-scaled.jpg': 'Congregation seated for worship',
  'IMG_9550-scaled.jpeg': 'Women of the parish at service',
  '1N5A0157-scaled.jpeg': 'Parish family group photo',
  'IMG_9295-scaled.jpg': 'Members in fellowship',
  'IMG_9292-scaled.jpg': 'Women of the parish at service',
  'IMG_9106-scaled.jpg': 'A mother of the church during service',
  'IMG_7547-scaled.jpg': 'Members celebrating together',
  'IMG_7431-scaled.jpg': 'A member at prayer',
  'IMG_7256-scaled.jpg': 'Women’s fellowship photo wall',
  '12-scaled.jpg': 'Mothers of the church at a celebration',
  'ccc_erith_parish-scaled.jpeg': 'The CCC Erith Parish family',
  '1N5A0023.jpeg': 'Congregation in worship',
  '1N5A0072-scaled.jpeg': 'The parish family gathered at the altar',
  'untitled-16-of-114-scaled.jpg': 'Young people of the parish',
  'untitled-35-of-114-scaled.jpg': 'Children during Sunday service',
}
const MINISTERS: Record<string, string> = {
  'IMG_9656-scaled.jpeg': 'Members outside the church on Bexley Road',
  'evangelism_1-scaled.jpeg': 'Evangelism team outside the church',
  'evangelism_2-scaled.jpeg': 'Evangelism and outreach team',
  'evangelism_3-scaled.jpeg': 'Brethren during outreach',
  'untitled-46-of-114-scaled.jpg': 'Minister leading prayer with the cross',
  'IMG_0551-scaled.jpeg': 'Ministers in prayer during service',
  'IMG_0500-scaled.jpeg': 'Ministers in fellowship',
  'IMG_9738-scaled.jpeg': 'Elders at a celebration service',
  '1N5A9950-scaled.jpeg': 'Ministers in their vestments at the altar',
  'IMG_9230-scaled.jpg': 'Shepherd in Charge celebrating with the parish',
  'IMG_8949-scaled.jpg': 'Ministers during a special service',
  'IMG_8058-scaled.jpg': 'Brethren outside the church',
  'IMG_7995-scaled.jpg': 'Ministers outside the church',
  'IMG_7336-scaled.jpg': 'Minister preaching outside the church',
  'IMG_9179-scaled.jpg': 'Shepherd in Charge and his wife',
  '1N5A0093-scaled.jpeg': 'Ministers of the parish',
  '1N5A9987-scaled.jpeg': 'A minister in white garment',
  'ccc_erith_parish_ministers-scaled.jpeg': 'Ministers of CCC Erith Parish',
  'IMG_2415-scaled.jpg': 'Shepherd at the altar',
}

const ALBUMS = [
  { title: 'Worship & Praise', description: 'Our choir and congregation lifting their voices in praise.', photos: WORSHIP },
  { title: 'Thanksgiving & Offerings', description: 'Joyful thanksgiving as the parish brings its gifts before God.', photos: THANKSGIVING },
  { title: 'Our Church Family', description: 'Fellowship, celebration and everyday parish life.', photos: FAMILY },
  { title: 'Ministers & Outreach', description: 'Our ministers, elders and outreach teams in service.', photos: MINISTERS },
]

// ---------------------------------------------------------------- rich text pages (Markdown)
const WHO_WE_ARE = `
At Celestial Church of Christ Noah’s Ark Erith Parish, we are a vibrant Christian church dedicated to sharing the love, truth, and salvation of Jesus Christ through worship, prayer, holiness, and compassionate service.

As part of the worldwide Celestial Church of Christ under the spiritual leadership of **Reverend Emmanuel Mobiyina Oshoffa**, we are committed to helping people grow in faith, experience God’s presence, and live according to biblical principles.

We welcome people from all backgrounds into a warm and spiritually uplifting community where individuals and families can encounter God, build meaningful relationships, and deepen their relationship with Jesus Christ through discipleship, biblical teaching, and prayer.
`

const COMMUNITY_TEXT = `
At Celestial Church of Christ Noah’s Ark Erith Parish, we believe the church should positively impact lives beyond the walls of the sanctuary.

We are committed to demonstrating the love of Christ through compassionate service and practical support — from our monthly food bank to prayer, counselling, youth empowerment and family support.

Celestial Church of Christ Erith Parish is a registered charity in England and Wales, committed to transparency and accountability in all our operations and ministry.
`

const MINISTRY_PHOTOS: Record<string, string[]> = {
  'prayer-prophetic-ministry': ['IMG_0551-scaled.jpeg', 'IMG_7431-scaled.jpg'],
  'choir-worship-ministry': ['IMG_7858-scaled.jpg', 'IMG_9316-scaled.jpeg', '2-scaled.jpg'],
  'youth-family-ministry': ['untitled-18-of-114-scaled.jpg', 'untitled-75-of-114-scaled.jpg', 'untitled-16-of-114-scaled.jpg'],
  'women-fellowship': ['IMG_7256-1-scaled.jpg', '12-scaled.jpg', 'IMG_9550-scaled.jpeg'],
  'men-fellowship': ['ccc_erith_parish_ministers-scaled.jpeg', 'IMG_7995-scaled.jpg'],
  'evangelism-outreach-ministry': ['evangelism_1-scaled.jpeg', 'evangelism_3-scaled.jpeg', 'IMG_9656-scaled.jpeg'],
  'ushering-hospitality-ministry': ['1N5A0058-scaled.jpeg', '1N5A0022-scaled.jpeg'],
  'media-communications-ministry': ['IMG_7426-scaled.jpg', 'IMG_9230-scaled.jpg'],
}

const SAFEGUARDING = `
### Our safeguarding commitment

Celestial Church of Christ, Noah’s Ark Erith Parish is fully committed to the care, protection, and safeguarding of all children, young people, and vulnerable adults within our community.

We firmly believe that every individual has the right to worship, learn, and grow in a safe, respectful, and secure environment — completely free from abuse, neglect, intimidation, or harm.

### Core principles

To uphold our commitment, we adhere strictly to the following standards:

- **Cultivating a safe culture:** fostering a welcoming, respectful, and supportive church environment for all members and visitors.
- **Legislative compliance:** operating in full alignment with official UK safeguarding legislation, statutory guidance, and best practices.
- **Dedicated oversight:** appointing trained Safeguarding Officers to oversee policy implementation and maintain accountability.
- **Prompt action:** responding swiftly, discreetly, and appropriately to any safeguarding concerns or disclosures raised.
- **Continuous education:** delivering relevant safeguarding awareness and training to our clergy, volunteers, and ministry leaders.
- **Multi-agency collaboration:** working transparently alongside local authorities, law enforcement, and statutory bodies whenever necessary.

### Reporting a concern

We take all safeguarding disclosures and concerns with the utmost seriousness. If you have a concern regarding the welfare of a child, young person, or vulnerable adult, please report it immediately:

- **Confidential contact form:** submit details securely via our [contact page](/contact).
- **Direct support:** speak directly to a member of our Church Leadership or Designated Safeguarding Lead.

> If you believe a child or vulnerable adult is in immediate danger, please call 999 for emergency services straight away.
`

const PRIVACY = `
**Effective date: 15 August 2026**

At Celestial Church of Christ Noah’s Ark Erith Parish (“we,” “us,” or “our”), we are committed to protecting your privacy and handling your personal data in an open, transparent, and lawful manner. This Privacy Policy outlines how we collect, use, store, and safeguard your personal information in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

### 1. Who we are (data controller)

Celestial Church of Christ Noah’s Ark Erith Parish operates as the Data Controller responsible for the personal information processed through our physical ministry, website, and digital communications.

If you have any questions about this policy or how we handle your personal data, please contact us:

- **Organisation:** Celestial Church of Christ Noah’s Ark Erith Parish
- **Email:** info@cccerithparish.co.uk
- **Postal address:** 33 Bexley Road, Erith, Kent, United Kingdom, DA8 1SH

### 2. Information we collect

We collect personal information that you voluntarily provide to us when engaging with our church, attending services, registering for events, or interacting with our online platforms. This includes:

- **Contact information:** full name, email address, phone number, and mailing address.
- **Communication data:** information submitted via website contact forms, email enquiries, or physical request forms (e.g. prayer requests, pastoral care queries).
- **Event & ministry registration:** names and contact details provided when registering for church events, membership directories, or voluntary groups.
- **Financial information:** details necessary for processing donations, tithes, or Gift Aid declarations (e.g. bank details, tax status for Gift Aid claims).
- **Special category data:** as a religious organisation, some data you provide (such as membership details or prayer requests) may reveal your religious beliefs. We handle this data with strict confidentiality and explicit consent, or under applicable legal exemptions for religious non-profit bodies.

### 3. Lawful basis and how we use your data

We process your personal information under the following lawful bases under UK GDPR:

- **Consent (Art. 6(1)(a)):** when you give explicit consent, such as opting in to receive newsletter updates or general announcements.
- **Legitimate interests (Art. 6(1)(f)):** to manage church administrative records, facilitate pastoral care, host church activities, and respond to general enquiries.
- **Legal obligation (Art. 6(1)(c)):** to comply with statutory requirements, such as maintaining accounting records and processing Gift Aid with HM Revenue & Customs (HMRC).
- **Special category data condition (Art. 9(2)(d)):** processing carried out in the course of our legitimate activities as a non-profit religious body, relating solely to members, former members, or individuals in regular contact with us.

Specifically, we use your data to:

- Provide pastoral care and respond to contact/prayer requests.
- Deliver church news, event schedules, and ministry communications.
- Maintain internal membership records and lawful administrative logs.
- Process financial contributions and claim Gift Aid.

### 4. How we share your information

We do not sell, trade, or rent your personal information to third parties. We may only disclose your personal information in the following limited circumstances:

- **Service providers:** trusted third-party IT, web hosting, email delivery, or payment processing services acting on our behalf under strict data processing agreements.
- **Legal and regulatory obligations:** when required by law or regulatory authorities (such as HMRC for Gift Aid auditing, law enforcement, or safeguarding authorities).

### 5. Data security

We implement appropriate technical and organisational measures to protect your personal data against unauthorised or unlawful processing, accidental loss, destruction, or damage. Access to personal information is strictly restricted to authorised church leadership, staff, and designated volunteers on a need-to-know basis.

### 6. Data retention

We retain personal information only for as long as necessary to fulfil the purposes for which it was collected, including satisfying any legal, accounting, or reporting obligations.

- General enquiries are kept until resolved.
- Membership and pastoral logs are kept as long as you remain active within the community.
- Financial and Gift Aid records are retained for a minimum of 6 years in accordance with UK tax laws.

### 7. Your data protection rights

Under the UK GDPR, you hold specific rights regarding your personal information:

- **Right of access:** request a copy of the personal data we hold about you.
- **Right to rectification:** request correction of inaccurate or incomplete information.
- **Right to erasure (“right to be forgotten”):** request deletion of your personal data where there is no legal requirement for us to keep it.
- **Right to restrict processing:** request restricted processing under certain circumstances.
- **Right to withdraw consent:** withdraw consent at any time where processing is based on consent.

To exercise any of these rights, please contact us using the details provided in Section 1.

### 8. Complaints

If you have concerns about how we collect or process your data, we encourage you to contact us directly so we can resolve the issue. You also have the right to lodge a complaint with the UK data protection supervisory authority:

**Information Commissioner’s Office (ICO)**, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF. Website: [ico.org.uk](https://ico.org.uk). Helpline: 0303 123 1113.

### 9. Changes to this privacy policy

We may update this Privacy Policy periodically to reflect changes in our legal obligations or operational practices. Any updates will be posted on our website with a revised effective date.
`

const COOKIES = `
### 1. Introduction

This Cookie Policy explains how Celestial Church of Christ Noah’s Ark Erith Parish (“we,” “us,” or “our”) uses cookies and similar technologies when you visit our website.

### 2. What are cookies?

Cookies are small data files placed on your computer or mobile device when you visit a website. They are widely used to make websites work and to provide reporting information.

### 3. How we use cookies

We keep cookies to an absolute minimum:

- **No tracking or advertising cookies.** Visitors browsing our website are not given any cookies.
- **Visitor statistics without cookies.** We use Cloudflare Web Analytics, which counts page visits without cookies and without identifying you.
- **Essential login cookie (church team only).** Members of our church team who sign in to manage the website receive a single essential cookie that keeps them signed in.
- **Spam protection.** Our contact form uses Cloudflare Turnstile to check that messages are sent by a person; it does not use advertising cookies.
- **Videos.** Sermon videos are embedded using YouTube’s privacy-enhanced mode and only load when you press play. YouTube may then set its own cookies, subject to Google’s privacy policy.

### 4. Managing your preferences

You can set your browser to refuse cookies. Our website will continue to work for visitors if you do.

### 5. Contact us

If you have any questions about our use of cookies, please contact us at info@cccerithparish.co.uk.
`

const TEAM_INTRO = `Celestial Church of Christ Noah’s Ark Erith Parish is led by ordained ministers and dedicated church workers committed to spiritual leadership, accountability, integrity, and service.

Our leadership team works prayerfully to guide the church community, support members spiritually, and promote the mission and values of the church.`

// ---------------------------------------------------------------- ministries
const MINISTRIES = [
  {
    title: 'Prayer & Prophetic Ministry',
    slug: 'prayer-prophetic-ministry',
    image: 'untitled-46-of-114-scaled.jpg',
    excerpt: 'The spiritual watchtower of our parish — intercession, prophetic guidance and spiritual consultation.',
    body: 'The Prayer & Prophetic Ministry stands as the spiritual watchtower of our parish, dedicated to consistent intercessory prayer, spiritual warfare, and prophetic guidance. Rooted in the rich spiritual tradition of the Celestial Church of Christ, this ministry conducts prayer vigils, counselling sessions, and spiritual consultations centred on dreams, visions, and biblical discernment.\n\nOur intercessors stand in the gap for the church, families, the sick, and those seeking divine breakthroughs. We provide a confidential and faith-filled atmosphere where individuals can receive spiritual direction, deliverance, and prayer support to walk in victory over life’s challenges.',
    times: [
      ['Prophet / Prophetess / Dreamers / Visioners Service', 'Fridays, 9:00pm – 10:30pm'],
      ['Mercy Day Devotional Service', 'Wednesdays'],
      ['Power Day Devotional Service', 'Fridays, 7:00pm – 8:45pm'],
      ['Spiritual Consultation', 'By appointment'],
    ],
  },
  {
    title: 'Choir & Worship Ministry',
    slug: 'choir-worship-ministry',
    image: 'IMG_9765-scaled.jpg',
    excerpt: 'Ushering the congregation into God’s presence through spirit-filled praise and celestial hymnody.',
    body: 'The Choir & Worship Ministry serves as the musical and spiritual engine of our church services, ushering the congregation into the presence of God through spirit-filled praise, worship, and classical celestial hymnody. Rooted in deep devotion and musical excellence, our choir leads the church in thanksgiving, traditional spiritual chants, and contemporary worship ministrations during regular services, feasts, and special celebrations.\n\nWe encourage singers, choristers, and instrumentalists to refine their spiritual and musical gifts for the glory of God. Beyond leading worship, our ministry is a tight-knit family dedicated to personal prayer, spiritual discipline, and joyful service.',
    times: [
      ['Choir Rehearsal', 'Thursdays, 6:00pm – 10:00pm'],
      ['Hour of Praise and Worship', 'Saturdays, 11:00am – 12:00pm'],
    ],
  },
  {
    title: 'Youth & Family Ministry',
    slug: 'youth-family-ministry',
    image: 'IMG_9285-scaled.jpg',
    excerpt: 'Helping children, young adults and families build an unshakable foundation in Christ.',
    body: 'The Youth & Family Ministry empowers children, young adults, and families to build an unshakable foundation in Christ while navigating the realities of modern life. Through structured biblical teaching, interactive workshops, mentorship, and faith-building social activities, we help the younger generation discover their divine purpose and cultivate strong Christian values.\n\nWe recognise that strong families build a strong church, which is why we provide dedicated resources, fellowship gatherings, and guidance for parents. Whether through Sunday youth sessions, seasonal retreats, or leadership development programmes, we are committed to raising a generation anchored in faith, integrity, and spiritual resilience.',
    times: [
      ['Online Bible Study & Youth Fellowship', 'Mondays at 5:00pm'],
      ['Youth Programmes and Activities', 'Third Sunday of every month'],
      ['Annual Youth Day Celebration', 'June'],
    ],
  },
  {
    title: 'Women Fellowship',
    slug: 'women-fellowship',
    image: '1N5A0081-scaled.jpeg',
    excerpt: 'A nurturing, spirit-filled sisterhood growing together in faith, prayer and purpose.',
    body: 'The Women Fellowship provides a nurturing, spirit-filled environment where women of all ages can come together to grow in faith, prayer, and sisterhood. Rooted in biblical principles, our fellowship focuses on spiritual empowerment, biblical womanhood, family support, and personal development.\n\nThrough monthly prayer meetings, Bible studies, annual conferences, and compassionate outreach initiatives, we encourage women to realise their God-given potential and fulfil their callings as pillars in their homes, the church, and the broader community. No matter where you are on your spiritual journey, you will find encouragement, mentorship, and a genuine community of faith here.',
    times: [
      ['Monthly Prayer Meeting', 'Monthly'],
      ['Annual Women Fellowship Programme', 'November'],
    ],
  },
  {
    title: 'Men Fellowship',
    slug: 'men-fellowship',
    image: 'IMG_0551-scaled.jpeg',
    excerpt: 'Equipping men to lead with integrity, faith and humility at home, at work and in God’s house.',
    body: 'The Men Fellowship is committed to equipping men to lead with integrity, faith, and humility in their homes, workplaces, and the house of God. Recognising the unique challenges men face today, our fellowship creates a safe space for open discussion, spiritual accountability, and Christian mentorship.\n\nThrough targeted Bible studies, prayer breakfasts, leadership seminars, and community service projects, we challenge one another to grow into godly husbands, fathers, leaders, and role models. We believe that when men step into their God-ordained roles with conviction and spiritual maturity, entire families and communities are transformed for Christ.',
    times: [
      ['Monthly Prayer Meeting and Activities', 'Monthly'],
      ['Annual Men Fellowship Programme', 'November'],
    ],
  },
  {
    title: 'Evangelism & Outreach Ministry',
    slug: 'evangelism-outreach-ministry',
    image: 'evangelism_2-scaled.jpeg',
    excerpt: 'Carrying the Gospel and practical love to Erith and beyond — including our monthly food bank.',
    body: 'The Evangelism & Outreach Ministry carries out the Great Commission by bringing the gospel of Jesus Christ to our surrounding community in Erith and beyond. Driven by compassion and dynamic faith, our team organises street evangelism, seasonal community fairs, welfare distributions, and charitable support programmes for those in need.\n\nWe believe that evangelism is both a spiritual invitation and a practical act of love. Through active partnership with local community networks, mission trips, and prison and hospital visitations, we work tirelessly to meet both the physical and spiritual needs of individuals, guiding seekers into a transformative relationship with Christ.',
    times: [['Food Bank Outreach', 'Last Saturday of each month from 10:00am']],
  },
  {
    title: 'Ushering & Hospitality Ministry',
    slug: 'ushering-hospitality-ministry',
    image: '1N5A0052-scaled.jpeg',
    excerpt: 'The welcoming face of our parish — ensuring every member and visitor feels valued.',
    body: 'The Ushering & Hospitality Ministry serves as the welcoming face of Celestial Church of Christ Noah’s Ark Erith Parish. Dedicated to reflecting the love and grace of God from the moment you step through our doors, our team ensures every member and visitor feels valued, comfortable, and spiritually supported.\n\nBeyond managing logistics, seat arrangement, and orderliness during our services and special ceremonies, our ushers and hospitality team care for the well-being of the congregation. Through warm greetings, attentive care, and seamless service, we foster an environment where attendees can focus entirely on worshipping God.',
    times: [['Usher / Onibode / Side Men & Women Fellowship', 'Tuesdays at 8:00pm']],
  },
  {
    title: 'Media & Communications Ministry',
    slug: 'media-communications-ministry',
    image: 'IMG_9148-scaled.jpg',
    excerpt: 'Using sound, video, photography and social media to carry the Word to the world.',
    body: 'The Media & Communications Ministry leverages modern technology and creative digital platforms to amplify the word of God and connect our church with the world. Responsible for audio engineering, high-definition livestreams, videography, photography, screen projections, and social media management, our team ensures that every service reaches both our in-person congregation and online worshippers globally.\n\nWhether you are passionate about sound engineering, video production, graphic design, or content creation, this ministry offers an engaging space to put technical skills to work for the Kingdom and ensure the message of hope is accessible everywhere.',
    times: [['Church activities', 'During services and events']],
  },
]

// ---------------------------------------------------------------- weekly timetable
const SERVICES = [
  { title: 'Sunday Worship Service', day: 'sunday', startTime: '10:00', endTime: '15:00', highlight: true },
  { title: 'Seekers Service', day: 'monday', startTime: '10:00', endTime: '12:00' },
  { title: 'Online Bible Study & Youth Fellowship', day: 'monday', startTime: '17:00', endTime: '18:30', note: 'Online' },
  { title: 'Usher / Onibode / Side Men & Women Fellowship', day: 'tuesday', startTime: '20:00' },
  { title: 'Mercy Day Devotional Service', day: 'wednesday', startTime: '10:00', endTime: '12:00' },
  { title: 'Choir Rehearsal', day: 'thursday', startTime: '18:00', endTime: '22:00' },
  { title: 'Pregnant Women Service', day: 'friday', startTime: '15:00', endTime: '16:00' },
  { title: 'Power Day Devotional Service', day: 'friday', startTime: '19:00', endTime: '20:45' },
  { title: 'Prophet / Prophetess / Dreamers / Visioners Service', day: 'friday', startTime: '21:00', endTime: '22:30' },
  { title: 'Hour of Praise and Worship', day: 'saturday', startTime: '11:00', endTime: '12:00' },
  { title: 'Environmental & Cleaning', day: 'saturday', allDay: true },
] as const

// ---------------------------------------------------------------- team  [church title, name, role]
const TEAM: { dept: string; members: [string, string, string, boolean?][] }[] = [
  {
    dept: 'Leadership',
    members: [
      ['V/S/E', 'Anthony O. Emmanuel (MPIC, JP)', 'CCC Kent Regional Head & Shepherd in Charge, CCC Erith Parish', true],
      ['A/V/S/E', 'Adebowale Olubori', 'Assistant Shepherd in Charge, CCC Erith Parish', true],
    ],
  },
  {
    dept: 'Prophet & Prophetess',
    members: [
      ['V/S/E Pro.', 'Anthony Emmanuel', 'Snr. Shepherd in Charge'],
      ['Prophetess M/C', 'Olorunfunmi Abiodun', 'Coordinator'],
      ['S/S/Pro.', 'Rapheal Gbemileke', 'Asst. Coordinator'],
      ['Prophet', 'Tunmise Odusanya', 'Asst. Coordinator II'],
    ],
  },
  {
    dept: 'Parochial Committee',
    members: [
      ['S/M/S/E', 'Babs Makanjuola', 'Chairman'],
      ['Elder Bro.', 'Temidayo Ajayi', 'Asst. Chairman'],
      ['H/S/E', 'Oluwatosin Oyedele', 'Church Secretary'],
      ['Sup. Evan.', 'Johnson Onakoya', 'Financial Secretary'],
    ],
  },
  {
    dept: 'Onibode',
    members: [
      ['Sup. Evg.', 'Johnson Onakoya', 'Head'],
      ['Evg.', 'Jimmi Tokunmoh', 'Asst. Head'],
      ['Hon. Snr. Evg.', 'Cornelius Adewole', 'Asst. Head'],
      ['S/S/E/S', 'Augusta Oke', 'Secretary'],
    ],
  },
  {
    dept: 'Food Bank Department',
    members: [
      ['M/C', 'Lydia Ologede', 'Coordinator'],
      ['M/C', 'Adeoye', 'Asst. Coordinator'],
      ['C/E/S', 'Theresa', 'Secretary'],
      ['L/S/S Pro.', 'Olajumoke Olabisi', 'Asst. Secretary'],
      ['Sis.', 'Helen', 'Treasurer'],
      ['Sis.', 'Adebumi Balogun', 'Asst. Treasurer'],
    ],
  },
  {
    dept: 'Welfare Department',
    members: [
      ['M/C Pro.', 'Victoria Isibor', 'Welfare'],
      ['M/C', 'Sharon Onakoya', 'Coordinator'],
      ['M/C', 'Oduwole', 'Asst. Welfare'],
      ['L/S/S/E/S', 'Rosemary Eboreime', 'Financial Secretary'],
    ],
  },
  { dept: 'Women of Virtue', members: [['M/C', 'Oluwakemi Emmanuel', 'Coordinator']] },
  {
    dept: 'Sunday School',
    members: [
      ['L/S/S Pro.', 'Olajumoke Olabisi', 'Coordinator'],
      ['S/E/S', 'Victoria Savage', 'Asst. Coordinator'],
    ],
  },
  {
    dept: 'Choir Department',
    members: [
      ['CEB', 'Oreoluwa Ajayi-Brown', 'Choir Master'],
      ['L/S/S', 'Oladunni Olaomo', 'Asst. Choir Mistress'],
      ['Leader', 'Seun-Taiwo Ogunseyin', 'Music Director'],
      ['CES', 'Oluwaseun Laja', 'Choir Secretary'],
      ['M/C', 'Lydia Ologede', 'Choir Matron'],
      ['CES', 'Ajoke Ogunseyin', 'Choir Treasurer'],
      ['Prophetess', 'Oluremi Odusanya', 'Choir Financial Secretary'],
      ['Prophet', 'Eminiolorun Alaka', 'Coordinator'],
      ['CEB', 'Jeff Oladapo', 'Band Master & Chief Whip'],
      ['Sis.', 'Henrietta', 'Welfare Officer'],
      ['Bro.', 'Moyosore Okiki', 'PRO'],
      ['Leader', 'Peter David', 'Technical Head'],
    ],
  },
  {
    dept: 'Youth Forum',
    members: [
      ['H/S/E', 'Oyedele Tosin', 'Youth Coordinator'],
      ['Sis.', 'Adenike Adenowo', 'Deputy Coordinator'],
      ['Elder Bro.', 'Temidayo Ajayi', 'Youth Secretary'],
      ['Cape Eld. Sis.', 'Theresa Kasso', 'Youth Welfare & Media Coordinator'],
      ['Cape Bro.', 'Yinka Adepoju', 'Spiritual/Worship Leader'],
      ['Cape Prophetess', 'Rachel Oke', 'Spiritual/Worship Leader'],
      ['Sis.', 'Lase Alaka', 'Program Coordinator'],
      ['Bro.', 'Omorogieva Ewan', 'Standard Bearer'],
      ['S/M/S/E', 'Yinka Olaofe', 'Patron'],
      ['M/C', 'Adewole', 'Matron'],
    ],
  },
]

// ---------------------------------------------------------------- run
const CONTENT_COLLECTIONS: CollectionSlug[] = [
  'pages',
  'sermons',
  'events',
  'weekly-services',
  'ministries',
  'albums',
  'team-members',
  'departments',
  'contact-messages',
  'media',
]

async function main() {
  const payload = await getPayload({ config })
  const log = (m: string) => payload.logger.info(`[seed] ${m}`)

  const existing = await payload.count({ collection: 'pages' })
  if (existing.totalDocs > 0) {
    if (process.env.SEED_RESET !== '1') {
      log('Content already exists. Re-run with SEED_RESET=1 to wipe content and seed again (logins are kept).')
      process.exit(0)
    }
    for (const c of CONTENT_COLLECTIONS) {
      await payload.delete({ collection: c, where: { id: { exists: true } }, overrideAccess: true })
      log(`cleared ${c}`)
    }
  }

  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const md = (markdown: string) => convertMarkdownToLexical({ editorConfig, markdown: markdown.trim() })

  // Images
  const media = new Map<string, number>()
  const allPhotos: Record<string, string> = { ...WORSHIP, ...THANKSGIVING, ...FAMILY, ...MINISTERS }
  for (const [file, alt] of Object.entries(allPhotos)) {
    const filePath = path.join(IMG_DIR, img(file))
    if (!fs.existsSync(filePath)) {
      log(`missing image ${filePath}, skipped`)
      continue
    }
    const doc = await payload.create({ collection: 'media', data: { alt }, filePath, overrideAccess: true })
    media.set(file, doc.id)
  }
  log(`uploaded ${media.size} images`)
  const videoPoster = await payload.create({ collection: 'media', data: { alt: 'A white dove flying above the clouds' }, filePath: path.join(IMG_DIR, 'dove-in-the-clouds-poster.webp'), overrideAccess: true })
  const video = await payload.create({ collection: 'media', data: { alt: 'A white dove flying above the clouds' }, filePath: path.join(IMG_DIR, 'dove-in-the-clouds.mp4'), overrideAccess: true })
  log('uploaded hero video')
  const m = (file: string) => {
    const id = media.get(file)
    if (!id) throw new Error(`Image not uploaded: ${file}`)
    return id
  }

  // Menu
  await payload.updateGlobal({ slug: 'navigation', overrideAccess: true, data: DEFAULT_NAVIGATION_DATA })
  log('set navigation menu')

  // Settings
  await payload.updateGlobal({
    slug: 'site-settings',
    overrideAccess: true,
    data: {
      churchName: 'Celestial Church of Christ Noah’s Ark Erith Parish',
      shortName: 'Erith Parish',
      tagline: 'The home of worship, prayer, holiness and spiritual transformation. CCC Kent Regional Headquarters UK.',
      address: '33 Bexley Road\nErith, Kent\nDA8 1SH',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=33+Bexley+Road+Erith+DA8+1SH',
      email: 'info@cccerithparish.co.uk',
      phone: '',
      officeHours: 'Monday – Sunday, 9am – 7pm',
      charityNumber: '1134663',
      facebook: 'https://www.facebook.com/cccerith',
      instagram: 'https://www.instagram.com/cccerith',
      youtube: '',
      tiktok: '',
      givingIntro:
        'Celestial Church of Christ Noah’s Ark Erith Parish is a registered UK charity committed to ministry, outreach, worship and community support. Your generous giving helps us continue serving God and supporting our local community.',
      paypalUrl: '',
      inPersonText: 'Bring your tithes and offerings to any of our services. Envelopes are available from the ushers.',
    },
  })

  // Pages
  const pages = [
    { title: 'Safeguarding Policy', slug: 'safeguarding-policy', intro: 'Keeping children, young people and vulnerable adults safe.', content: md(SAFEGUARDING) },
    { title: 'Privacy Policy', slug: 'privacy-policy', intro: 'How we collect, use and protect your personal information.', content: md(PRIVACY) },
    { title: 'Cookie Policy', slug: 'cookie-policy', intro: 'How our website uses cookies.', content: md(COOKIES) },
    { title: 'Our Team', slug: 'our-team', intro: 'The ministers and church workers who serve our parish.', content: md(TEAM_INTRO) },
  ]
  for (const p of pages) await payload.create({ collection: 'pages', data: p, overrideAccess: true })
  log(`created ${pages.length} pages`)

  await payload.updateGlobal({
    slug: 'about-page',
    overrideAccess: true,
    data: {
      intro: 'A vibrant Christian family in Erith, sharing the love, truth and salvation of Jesus Christ through worship, prayer, holiness and compassionate service.',
      heroPhotos: [m('ccc_erith_parish-scaled.jpeg'), m('1N5A9960-scaled.jpeg'), m('1N5A0081-scaled.jpeg')],
      whoHeading: 'Who we are',
      whoText: md(WHO_WE_ARE),
      whoPhotos: [m('1N5A0072-scaled.jpeg'), m('untitled-46-of-114-scaled.jpg'), m('IMG_9316-scaled.jpeg')],
      quote: 'Raising a holy people devoted to God, His Word, and His Spirit.',
      quoteCite: 'Our vision',
      storyHeading: 'Our story',
      storySteps: [
        { label: 'Our beginning', title: 'Part of a global mission', text: 'Celestial Church of Christ Noah’s Ark Erith Parish was established as part of the global mission of the Celestial Church of Christ to spread the Gospel and uphold the teachings of holiness and prayer.', image: m('ccc_erith_parish_ministers-scaled.jpeg') },
        { label: 'Growing together', title: 'A spiritual home in Erith', text: 'Over the years, the parish has grown into a vibrant spiritual home serving the people of Erith, Kent, and surrounding communities — impacting lives through worship services, youth development programmes, charitable outreach, counselling support, and spiritual guidance.', image: m('IMG_9285-scaled.jpg') },
        { label: 'Today', title: 'CCC Kent Regional Headquarters UK', text: 'Today, the church proudly serves as the CCC Kent Regional Headquarters in the United Kingdom and continues to grow as a centre for faith, worship, healing, and community service.', image: m('1N5A9950-scaled.jpeg') },
      ],
      beliefsHeading: 'Our core beliefs',
      beliefs: [
        { title: 'The Holy Trinity — Father, Son, and Holy Spirit', icon: 'sparkle' },
        { title: 'Salvation through Jesus Christ', icon: 'cross' },
        { title: 'The authority and truth of the Holy Bible', icon: 'book' },
        { title: 'Prayer, fasting, and holy living', icon: 'flame' },
        { title: 'Divine guidance through the Holy Spirit', icon: 'dove' },
        { title: 'Love, peace, righteousness, and compassion', icon: 'heart' },
        { title: 'Serving humanity through Christian outreach and charity', icon: 'hand' },
      ],
      valuesHeading: 'Our core values',
      values: [
        { title: 'Holiness', text: 'Living according to God’s Word and Christian principles.' },
        { title: 'Faith', text: 'Trusting God completely in every circumstance.' },
        { title: 'Love', text: 'Demonstrating compassion, kindness, and care to all people.' },
        { title: 'Unity', text: 'Building one body in Christ through fellowship and peace.' },
        { title: 'Service', text: 'Supporting our church family and wider community through acts of kindness and outreach.' },
      ],
      showLeaders: true,
      leadersText: 'Our parish is led by ordained ministers and dedicated church workers committed to spiritual leadership, accountability, integrity, and service.',
    },
  })

  await payload.updateGlobal({
    slug: 'community-page',
    overrideAccess: true,
    data: {
      intro: 'Showing the love of Christ beyond the walls of the sanctuary.',
      text: md(COMMUNITY_TEXT),
      photos: [m('IMG_9656-scaled.jpeg'), m('evangelism_1-scaled.jpeg'), m('evangelism_3-scaled.jpeg'), m('IMG_8058-scaled.jpg')],
      programmesHeading: 'Our outreach and community programmes',
      programmes: [
        { title: 'Food bank and welfare support', icon: 'basket' },
        { title: 'Community outreach services', icon: 'globe' },
        { title: 'Prayer and counselling support', icon: 'chat' },
        { title: 'Youth empowerment programmes', icon: 'sparkle' },
        { title: 'Family support initiatives', icon: 'home' },
        { title: 'Educational and mentoring activities', icon: 'school' },
        { title: 'Charity and humanitarian assistance', icon: 'hand' },
      ],
      charity: {
        legalName: 'Celestial Church of Christ Erith Parish',
        number: '1134663',
        address: '33 Bexley Road, Erith, Kent, DA8 1SH',
        governingDocument: 'Church Constitution',
        registerUrl: 'https://register-of-charities.charitycommission.gov.uk/en/charity-search/-/charity-details/4045961/contact-information',
      },
    },
  })
  log('about + community pages set')

  // Home page
  await payload.updateGlobal({
    slug: 'home-page',
    overrideAccess: true,
    data: {
      heroEyebrow: 'Join us this Sunday',
      heroHeading: 'You belong here',
      heroText: 'Welcome to Celestial Church of Christ Noah’s Ark Erith Parish — a home of worship, prayer, holiness and spiritual transformation.',
      heroSlides: [
        { media: video.id, poster: videoPoster.id, focus: 'center' },
        { media: m('1N5A9960-scaled.jpeg'), focus: 'center' },
        { media: m('1N5A0072-scaled.jpeg'), eyebrow: 'CCC Kent Regional Headquarters UK', heading: 'One family, one faith', text: 'Worship with us every Sunday from 10am at 33 Bexley Road, Erith.', buttonLabel: 'Service times', buttonHref: '/events', focus: 'center' },
        { media: m('IMG_9765-scaled.jpg'), eyebrow: 'Praise & worship', heading: 'Lift your voice with us', buttonLabel: 'Our ministries', buttonHref: '/ministries', focus: 'center' },
      ],
      heroSettings: { autoplay: true, pauseOnHover: true, showArrows: true, showDots: true, interval: 7, transition: 'fade', speed: 'normal', overlay: 'medium' },
      stripPhotos: ['IMG_7858-scaled.jpg', 'untitled-18-of-114-scaled.jpg', '1N5A9931-scaled.jpeg', 'IMG_9230-scaled.jpg', '1N5A0081-scaled.jpeg', 'untitled-75-of-114-scaled.jpg', 'IMG_9746-scaled.jpg', '1N5A0157-scaled.jpeg', 'IMG_9316-scaled.jpeg', '12-scaled.jpg', 'IMG_7547-scaled.jpg', '1N5A0003-scaled.jpeg'].map(m),
      heroPrimary: { label: 'Plan your visit', href: '/contact' },
      heroSecondary: { label: 'Service times', href: '/events' },
      welcomeHeading: 'Welcome to CCC Noah’s Ark Erith Parish',
      welcomeText:
        'As the CCC Kent Regional Headquarters UK, we are committed to preaching the Gospel of Jesus Christ, nurturing spiritual growth, and serving our community with love, compassion, and faith. Guided by the Holy Spirit, we warmly welcome everyone seeking worship, fellowship, and a deeper relationship with God.',
      welcomeImages: [m('ccc_erith_parish-scaled.jpeg'), m('untitled-46-of-114-scaled.jpg')],
      pillars: [
        { title: 'Our Vision', text: 'Raising a holy people devoted to God, His Word, and His Spirit.' },
        { title: 'Our Mission', text: 'To spread the Gospel, nurture faith, and serve humanity with love.' },
        { title: 'Our Values', text: 'Holiness, Faith, Love, Unity, and Service.' },
      ],
      stats: [
        { value: 8, label: 'Ministries' },
        { value: 11, label: 'Weekly gatherings' },
        { value: 70, suffix: '+', label: 'Church workers' },
      ],
      involvedHeading: 'Get involved today',
      involvedText: 'Christianity is meant to be lived out in community. Discover ways to connect, serve and grow with us.',
      involved: [
        { title: 'Join a fellowship', text: 'Build lasting relationships and grow in faith together.', image: m('untitled-50-of-114-scaled-e1786218818724.jpg'), href: '/ministries' },
        { title: 'Volunteer', text: 'Use your gifts to serve in areas like worship, hospitality and outreach.', image: m('1N5A0036-e1786219955255.jpeg'), href: '/contact' },
        { title: 'Missions & outreach', text: 'Help us make a difference locally and globally.', image: m('IMG_7338-scaled-e1786220105395.jpg'), href: '/community-service' },
      ],
      givingHeading: 'Support the work of God',
      givingText: 'Your generosity helps us serve our community, support missions, and continue sharing the message of hope. Every contribution makes a difference.',
      givingImage: m('1N5A9931-scaled.jpeg'),
    },
  })
  log('home page set')

  // Weekly services
  for (const s of SERVICES) await payload.create({ collection: 'weekly-services', data: { ...s }, overrideAccess: true })
  log(`created ${SERVICES.length} weekly services`)

  // Ministries
  for (const x of MINISTRIES) {
    await payload.create({
      collection: 'ministries',
      overrideAccess: true,
      data: {
        title: x.title,
        slug: x.slug,
        image: m(x.image),
        excerpt: x.excerpt,
        body: md(x.body),
        gallery: (MINISTRY_PHOTOS[x.slug] ?? []).map(m),
        meetingTimes: x.times.map(([label, when]) => ({ label, when })),
        location: 'Church premises',
      },
    })
  }
  log(`created ${MINISTRIES.length} ministries`)

  // Team
  let people = 0
  for (const group of TEAM) {
    const dept = await payload.create({ collection: 'departments', data: { name: group.dept }, overrideAccess: true })
    for (const [churchTitle, name, role, featured] of group.members) {
      await payload.create({ collection: 'team-members', overrideAccess: true, data: { churchTitle, name, role, department: dept.id, featured: Boolean(featured) } })
      people++
    }
  }
  log(`created ${TEAM.length} departments, ${people} team members`)

  // Gallery
  for (const a of ALBUMS) {
    const photos = Object.keys(a.photos).filter((f) => media.has(f)).map(m)
    await payload.create({ collection: 'albums', overrideAccess: true, data: { title: a.title, description: a.description, date: '2026-08-01', photos, cover: photos[0] } })
  }
  log(`created ${ALBUMS.length} albums`)

  log('done')
  process.exit(0)
}

try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
