import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const COMPANY = "Texas Bath Solutions";

export function LegalTerms() {
  const year = new Date().getFullYear();
  return (
    <div className="border-t border-neutral-900/10">
      <div className="container-x py-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="terms" className="border-none">
            <AccordionTrigger className="text-xs font-semibold text-neutral-700 hover:no-underline">
              Terms &amp; Conditions of Use, Legal Disclaimers, and Privacy Notice (click to read)
            </AccordionTrigger>
            <AccordionContent>
              <div className="max-h-[28rem] overflow-y-auto pr-3 text-[11px] leading-relaxed text-neutral-700 space-y-4">
                <p className="font-semibold text-neutral-900">
                  TERMS AND CONDITIONS OF USE — Last updated: {year}
                </p>

                <p>
                  PLEASE READ THESE TERMS AND CONDITIONS OF USE (the &ldquo;Terms&rdquo;) CAREFULLY
                  BEFORE USING THIS WEBSITE. These Terms constitute a legally binding agreement
                  between you (&ldquo;you,&rdquo; &ldquo;your,&rdquo; or &ldquo;User&rdquo;) and{" "}
                  {COMPANY}, together with its owners, members, managers, officers, employees,
                  agents, contractors, subcontractors, affiliates, successors, and assigns
                  (collectively, &ldquo;{COMPANY},&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
                  &ldquo;our&rdquo;), governing your access to and use of this website, all
                  subdomains, all associated pages, forms, scheduling tools, media, and content
                  (collectively, the &ldquo;Site&rdquo;). BY ACCESSING, BROWSING, OR OTHERWISE USING
                  THE SITE, OR BY SUBMITTING ANY FORM, REQUEST, OR INQUIRY THROUGH THE SITE, YOU
                  ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS.
                  IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST IMMEDIATELY DISCONTINUE ALL USE OF
                  THE SITE.
                </p>

                <p className="font-semibold text-neutral-900">1. Eligibility and Authority</p>
                <p>
                  You represent and warrant that you are at least eighteen (18) years of age, that
                  you possess the legal capacity to enter into a binding contract under the laws of
                  the State of Texas, and that all information you submit through the Site is
                  truthful, accurate, current, and complete. If you use the Site on behalf of
                  another person or entity, you represent that you are duly authorized to bind that
                  person or entity to these Terms.
                </p>

                <p className="font-semibold text-neutral-900">
                  2. Marketing Language, Puffery, and the Term &ldquo;Hassle-Free&rdquo;
                </p>
                <p>
                  You expressly acknowledge and agree that the words &ldquo;hassle free,&rdquo;
                  &ldquo;hassle-free,&rdquo; &ldquo;zero hassle,&rdquo; &ldquo;no hassle,&rdquo; and
                  any grammatical variation thereof, wherever used on the Site, in any
                  advertisement, social media post, printed material, email, text message,
                  broadcast, or other communication by or on behalf of {COMPANY}, constitute
                  subjective marketing expression, opinion, and non-actionable puffery reflecting{" "}
                  {COMPANY}&rsquo;s own perspective, aspiration, and internal standard of service.
                  Such language is NOT a warranty, guarantee, representation of fact, promise of
                  outcome, or contractual term of any kind, and does not necessarily mean that a
                  customer, prospective customer, household member, guest, neighbor, or other person
                  will not experience what they, from their own subjective perspective, consider to
                  be a hassle, inconvenience, delay, disruption, noise, dust, debris, odor, water
                  shut-off, restricted access, scheduling change, discomfort, annoyance,
                  frustration, dissatisfaction, or other burden.
                </p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY TEXAS LAW, {COMPANY} SHALL NOT BE LIABLE TO ANY
                  PERSON FOR ANY DISCOMFORT, INCONVENIENCE, ANNOYANCE, HASSLE, IRRITATION, EMOTIONAL
                  DISTRESS, MENTAL ANGUISH, FRUSTRATION, DISAPPOINTMENT, LOSS OF ENJOYMENT, LOSS OF
                  USE, OR ANY SIMILAR SUBJECTIVE OR INTANGIBLE HARM ARISING FROM OR RELATING TO THE
                  SITE, ITS CONTENT, ANY ADVERTISEMENT, ANY COMMUNICATION, ANY ESTIMATE
                  APPOINTMENT, OR ANY REMODELING, INSTALLATION, OR RELATED SERVICES, WHETHER SUCH
                  CLAIM SOUNDS IN CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, STATUTE, OR
                  OTHERWISE. Home remodeling is inherently disruptive by nature, and you acknowledge
                  that construction activity ordinarily involves noise, dust, debris, temporary loss
                  of fixture use, workers present in the home, and schedule variability.
                </p>

                <p className="font-semibold text-neutral-900">
                  3. Informational Purpose Only; No Offer, No Contract, No Binding Quote
                </p>
                <p>
                  All content on the Site — including descriptions of products, materials, acrylic
                  and Onyx shower systems, finishes, colors, photographs, renderings, before-and-after
                  imagery, videos, timelines, project durations, service areas, and pricing such as
                  any &ldquo;starting at&rdquo; figure — is provided for general informational and
                  marketing purposes only. Nothing on the Site constitutes an offer capable of
                  acceptance, a binding quote, a firm bid, a fixed price, or a contract for services.
                  Any and all work performed by {COMPANY} is governed exclusively by a separate
                  written agreement signed by both parties, which shall control in the event of any
                  conflict with the Site or these Terms. Advertised prices are subject to change
                  without notice and depend on scope, site conditions, materials selected, code
                  requirements, permits, plumbing configuration, substrate condition, and other
                  factors that can only be assessed in person.
                </p>

                <p className="font-semibold text-neutral-900">
                  4. Photographs, Imagery, and Representative Examples
                </p>
                <p>
                  Images, videos, and renderings on the Site may be representative, illustrative,
                  digitally enhanced, staged, stock, or composed for demonstration purposes and may
                  not depict actual completed projects performed by {COMPANY} at any particular
                  address. Colors, textures, veining, and finishes vary by monitor, lighting, and
                  manufacturing lot, and actual installed products may differ in appearance from
                  what is displayed.
                </p>

                <p className="font-semibold text-neutral-900">
                  5. Estimate Requests, Scheduling, and Third-Party Scheduling Tools
                </p>
                <p>
                  Submitting a form or scheduling request does not create a customer relationship,
                  reserve materials, or obligate {COMPANY} to perform any work. {COMPANY} reserves
                  the right, in its sole discretion, to decline, reschedule, or cancel any
                  appointment or project for any lawful reason. Scheduling functionality on the Site
                  may be provided by independent third-party services. Your use of such third-party
                  services is subject to their own terms and privacy policies, and {COMPANY} is not
                  responsible for their availability, accuracy, data handling, outages, or errors.
                </p>

                <p className="font-semibold text-neutral-900">
                  6. Telephone, Text Message (SMS), and Email Consent
                </p>
                <p>
                  By providing your telephone number and submitting a form on the Site, you give
                  your prior express written consent for {COMPANY} and its authorized agents to
                  contact you at that number — including by automatic telephone dialing system,
                  prerecorded or artificial voice, and SMS/MMS text message — regarding your
                  inquiry, appointment confirmations, reminders, follow-ups, offers, and related
                  marketing, even if the number appears on a state or federal Do-Not-Call registry.
                  Consent is not a condition of purchase. Message and data rates may apply. Message
                  frequency varies. You may opt out at any time by replying STOP to any text message
                  or by using the unsubscribe link in any email; you may reply HELP for assistance.
                  You are responsible for notifying us if your telephone number changes.
                </p>

                <p className="font-semibold text-neutral-900">
                  7. Financing, Credit Inquiries, and Promotional Offers
                </p>
                <p>
                  Any reference to &ldquo;$0 down,&rdquo; &ldquo;no payments,&rdquo; deferred
                  payment periods, promotional terms, or a &ldquo;soft credit check&rdquo; describes
                  programs offered by independent third-party lenders and finance companies, not by{" "}
                  {COMPANY}. {COMPANY} is not a lender, broker, or credit services organization and
                  does not extend credit, guarantee approval, or set rates or terms. All financing is
                  subject to credit approval, lender underwriting criteria, program availability,
                  minimum purchase amounts, and the lender&rsquo;s own agreements and disclosures,
                  all of which control. Promotional and discount offers (including but not limited to
                  teacher, military and veteran, first responder, senior, and seasonal promotions)
                  are limited-time, subject to verification of eligibility, may not be combined
                  except as expressly stated, apply only to qualifying purchases, have no cash value,
                  and may be modified or withdrawn at any time without notice.
                </p>

                <p className="font-semibold text-neutral-900">
                  8. Testimonials, Reviews, and Ratings
                </p>
                <p>
                  Testimonials, reviews, star ratings, and accreditation references reflect the
                  individual experiences or determinations of particular persons or organizations at
                  a particular time, are not necessarily typical, and are not a guarantee,
                  prediction, or assurance that you or anyone else will obtain the same or similar
                  results.
                </p>

                <p className="font-semibold text-neutral-900">
                  9. Warranties Relating to Services
                </p>
                <p>
                  Any product or workmanship warranty, including any reference to a
                  &ldquo;lifetime&rdquo; warranty, is provided solely as, and strictly subject to the
                  terms, exclusions, limitations, transfer restrictions, registration requirements,
                  and claim procedures set forth in, the applicable written warranty document issued
                  by {COMPANY} or by the product manufacturer. No statement on the Site creates,
                  expands, or modifies any warranty.
                </p>

                <p className="font-semibold text-neutral-900">
                  10. DISCLAIMER OF WARRANTIES REGARDING THE SITE
                </p>
                <p>
                  THE SITE AND ALL CONTENT, MATERIALS, INFORMATION, AND FUNCTIONALITY ARE PROVIDED
                  &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE,&rdquo; WITH ALL FAULTS AND WITHOUT
                  WARRANTY OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, {COMPANY}{" "}
                  EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR
                  OTHERWISE, INCLUDING WITHOUT LIMITATION THE IMPLIED WARRANTIES OF MERCHANTABILITY,
                  FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, AND ANY
                  WARRANTIES ARISING FROM COURSE OF DEALING, COURSE OF PERFORMANCE, OR USAGE OF
                  TRADE. {COMPANY} DOES NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, TIMELY,
                  SECURE, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS, OR THAT ANY
                  INFORMATION ON THE SITE IS ACCURATE, COMPLETE, OR CURRENT.
                </p>

                <p className="font-semibold text-neutral-900">
                  11. LIMITATION OF LIABILITY
                </p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY THE LAWS OF THE STATE OF TEXAS, IN NO EVENT
                  SHALL {COMPANY} BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                  EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA,
                  GOODWILL, BUSINESS OPPORTUNITY, USE, OR ENJOYMENT, ARISING OUT OF OR RELATING TO
                  YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SITE, EVEN IF{" "}
                  {COMPANY} HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. TO THE MAXIMUM
                  EXTENT PERMITTED BY LAW, {COMPANY}&rsquo;S TOTAL AGGREGATE LIABILITY ARISING FROM
                  OR RELATING TO THE SITE SHALL NOT EXCEED ONE HUNDRED U.S. DOLLARS ($100.00). SOME
                  JURISDICTIONS DO NOT ALLOW CERTAIN EXCLUSIONS OR LIMITATIONS, SO SOME OF THE
                  ABOVE MAY NOT APPLY TO YOU; IN SUCH CASE, LIABILITY IS LIMITED TO THE GREATEST
                  EXTENT PERMITTED BY LAW. NOTHING IN THESE TERMS EXCLUDES OR LIMITS LIABILITY THAT
                  MAY NOT LAWFULLY BE EXCLUDED OR LIMITED UNDER TEXAS LAW, INCLUDING LIABILITY FOR
                  FRAUD, GROSS NEGLIGENCE, OR PERSONAL INJURY CAUSED BY NEGLIGENCE.
                </p>

                <p className="font-semibold text-neutral-900">12. Indemnification</p>
                <p>
                  You agree to defend, indemnify, and hold harmless {COMPANY} from and against any
                  and all claims, demands, actions, damages, losses, liabilities, judgments, costs,
                  and expenses (including reasonable attorneys&rsquo; fees and court costs) arising
                  out of or relating to your use of the Site, your violation of these Terms, your
                  violation of any applicable law, or your infringement of the rights of any third
                  party.
                </p>

                <p className="font-semibold text-neutral-900">
                  13. Intellectual Property
                </p>
                <p>
                  All content on the Site — including text, graphics, logos, trade names, trade
                  dress, trademarks, service marks, photographs, video, audio, layout, and software
                  — is owned by or licensed to {COMPANY} and is protected by United States and
                  international copyright, trademark, and other intellectual property laws. You may
                  view and print pages for your own personal, non-commercial use only. You may not
                  copy, reproduce, republish, distribute, modify, create derivative works from,
                  publicly display, frame, scrape, data-mine, or otherwise exploit any portion of
                  the Site without our prior written consent.
                </p>

                <p className="font-semibold text-neutral-900">14. Prohibited Conduct</p>
                <p>
                  You agree not to: (a) use the Site for any unlawful, fraudulent, or malicious
                  purpose; (b) submit false, misleading, or another person&rsquo;s information;
                  (c) attempt to gain unauthorized access to the Site, its servers, or related
                  systems; (d) introduce viruses, malware, or other harmful code; (e) use automated
                  means to access, scrape, or harvest content or contact information; (f) interfere
                  with or disrupt the operation, integrity, or security of the Site; or (g) use the
                  Site in violation of any applicable federal, state, or local law, including
                  Chapter 33 of the Texas Penal Code.
                </p>

                <p className="font-semibold text-neutral-900">
                  15. Privacy and Data Collection
                </p>
                <p>
                  Information you submit through forms on the Site (such as name, telephone number,
                  email address, service address, project timeframe, and project notes) is collected
                  and used to respond to your inquiry, schedule and service appointments, provide
                  estimates, and market our services. We may also collect technical data such as IP
                  address, browser type, device information, referring pages, and usage analytics.
                  We do not sell your personal information for money. Data may be shared with
                  service providers, scheduling platforms, financing partners, and installers acting
                  on our behalf, or as required by law, subpoena, or lawful governmental request.
                  Texas residents may have rights under the Texas Data Privacy and Security Act,
                  including the right to confirm, access, correct, delete, obtain a copy of, or
                  request that we cease certain processing of their personal data, and the right to
                  appeal a denial of such a request. To exercise these rights, contact us through
                  the Site. No transmission over the internet is fully secure, and we cannot
                  guarantee absolute security of information transmitted to us.
                </p>

                <p className="font-semibold text-neutral-900">
                  16. Third-Party Links and Services
                </p>
                <p>
                  The Site may contain links to third-party websites, tools, or services, which are
                  provided for convenience only. {COMPANY} does not control, endorse, or assume
                  responsibility for the content, accuracy, policies, products, or practices of any
                  third party, and your dealings with any third party are solely between you and
                  that third party.
                </p>

                <p className="font-semibold text-neutral-900">
                  17. Accessibility
                </p>
                <p>
                  {COMPANY} strives to make the Site reasonably accessible. If you encounter
                  difficulty accessing any portion of the Site, please contact us so we may attempt
                  to assist you and provide the information you need through an alternative method.
                </p>

                <p className="font-semibold text-neutral-900">
                  18. Governing Law, Venue, and Dispute Resolution
                </p>
                <p>
                  These Terms and any dispute arising out of or relating to them or the Site are
                  governed by the laws of the State of Texas, without regard to its conflict-of-laws
                  principles. You agree that exclusive venue and jurisdiction for any action not
                  subject to arbitration shall lie in the state or federal courts located in Bexar
                  County, Texas, and you waive any objection to such venue. THE PARTIES AGREE THAT
                  ANY DISPUTE SHALL FIRST BE SUBMITTED TO GOOD-FAITH NEGOTIATION FOR THIRTY (30)
                  DAYS FOLLOWING WRITTEN NOTICE AND, IF UNRESOLVED, MAY BE RESOLVED BY BINDING
                  INDIVIDUAL ARBITRATION ADMINISTERED IN BEXAR COUNTY, TEXAS, UNDER THE TEXAS
                  GENERAL ARBITRATION ACT AND/OR THE FEDERAL ARBITRATION ACT AS APPLICABLE. TO THE
                  EXTENT PERMITTED BY LAW, THE PARTIES WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS,
                  COLLECTIVE, OR REPRESENTATIVE ACTION. Nothing herein prevents either party from
                  seeking relief in a small claims court of competent jurisdiction.
                </p>

                <p className="font-semibold text-neutral-900">
                  19. Texas Deceptive Trade Practices Act Notice
                </p>
                <p>
                  Nothing in these Terms is intended to waive, and you do not waive, any right you
                  may have under the Texas Deceptive Trade Practices–Consumer Protection Act, Tex.
                  Bus. &amp; Com. Code §17.41 et seq., except as expressly permitted by that statute.
                  Any provision found to conflict with a non-waivable consumer right shall be
                  enforced only to the extent permitted by law.
                </p>

                <p className="font-semibold text-neutral-900">
                  20. Force Majeure
                </p>
                <p>
                  {COMPANY} shall not be liable for any delay or failure in performance or in the
                  availability of the Site caused by events beyond its reasonable control, including
                  acts of God, severe weather, flood, freeze, fire, pandemic or epidemic, labor
                  disputes, supply chain disruption, material shortages, utility or internet outages,
                  cyberattack, governmental action, or permitting delays.
                </p>

                <p className="font-semibold text-neutral-900">
                  21. Changes to the Site and to These Terms
                </p>
                <p>
                  {COMPANY} may modify, suspend, or discontinue any portion of the Site, and may
                  revise these Terms, at any time and without prior notice. Revised Terms are
                  effective upon posting, and your continued use of the Site after posting
                  constitutes acceptance. You should review these Terms periodically.
                </p>

                <p className="font-semibold text-neutral-900">
                  22. Severability, Waiver, Assignment, and Entire Agreement
                </p>
                <p>
                  If any provision of these Terms is held invalid, illegal, or unenforceable, that
                  provision shall be modified to the minimum extent necessary to make it enforceable
                  or, if modification is not possible, severed, and the remaining provisions shall
                  remain in full force and effect. No failure or delay by {COMPANY} in exercising any
                  right constitutes a waiver of that right. You may not assign these Terms without
                  our prior written consent; {COMPANY} may assign them freely. These Terms, together
                  with any signed written services agreement, constitute the entire agreement between
                  the parties regarding the Site and supersede all prior or contemporaneous
                  understandings, representations, and communications.
                </p>

                <p className="font-semibold text-neutral-900">23. Survival</p>
                <p>
                  Sections concerning marketing language and puffery, disclaimers, limitation of
                  liability, indemnification, intellectual property, governing law and dispute
                  resolution, and severability survive any termination of your use of the Site.
                </p>

                <p>
                  © {year} {COMPANY}. All rights reserved. Licensed and insured. Serving San Antonio,
                  Texas and surrounding communities.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
