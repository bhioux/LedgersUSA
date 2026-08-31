import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Calculator, FolderKanban, ShieldCheck, Users, FileText, Briefcase, ArrowRight, Search, Sparkles } from "lucide-react";

const strategyCatalog = [
  {
    id: "augusta",
    name: "Augusta Rule",
    fit: ["s_corp", "llc_taxed_s", "single_owner"],
    requiresHome: true,
    minIncome: 100000,
    tag: "Tax-free rent",
    summary: "Rent your home to your business for qualifying meetings up to 14 days per year.",
    docs: ["Board Resolution", "Meeting Minutes", "Rental Agreement", "Market Rent Analyzer", "Event Log"],
  },
  {
    id: "accountable",
    name: "Accountable Plan",
    fit: ["s_corp", "llc_taxed_s", "single_owner", "partnership"],
    requiresHome: false,
    minIncome: 50000,
    tag: "Expense reimbursement",
    summary: "Reimburse valid business expenses without turning them into taxable wages.",
    docs: ["Plan Policy", "Board Resolution", "Reimbursement Form", "Expense Log", "Home Office Calculator"],
  },
  {
    id: "s_corp_opt",
    name: "S-Corp Optimization",
    fit: ["single_owner", "llc_single", "llc_multi"],
    requiresHome: false,
    minIncome: 90000,
    tag: "Entity planning",
    summary: "Evaluate whether an S-Corp election and salary strategy could reduce self-employment taxes.",
    docs: ["Reasonable Compensation Review", "Entity Checklist", "Salary Optimization Calculator"],
  },
  {
    id: "vehicle",
    name: "Vehicle Strategy",
    fit: ["s_corp", "llc_taxed_s", "single_owner", "partnership"],
    requiresHome: false,
    minIncome: 120000,
    tag: "Bonus depreciation",
    summary: "Review Section 179 and bonus depreciation opportunities for qualifying business vehicles.",
    docs: ["Vehicle Deduction Calculator", "Business Use Log", "Compliance Memo"],
  },
  {
    id: "retirement",
    name: "Retirement Optimization",
    fit: ["s_corp", "llc_taxed_s", "single_owner", "partnership"],
    requiresHome: false,
    minIncome: 80000,
    tag: "Solo 401(k)",
    summary: "Maximize retirement contributions and align them with entity structure and income level.",
    docs: ["Retirement Contribution Calculator", "Plan Comparison", "Implementation Checklist"],
  },
];

const experts = [
  { name: "Payroll Specialist", category: "Payroll & S-Corp Wages", description: "Reasonable compensation setup, payroll onboarding, officer payroll support." },
  { name: "QBO / Bookkeeping Expert", category: "Bookkeeping", description: "Chart of accounts cleanup, reimbursement workflows, monthly close readiness." },
  { name: "Retirement Plan Advisor", category: "Retirement Plans", description: "Solo 401(k), SEP IRA, cash balance coordination." },
  { name: "Business Attorney", category: "Legal / Entity", description: "Entity documents, resolutions, agreements, operating documents." },
];

function scoreStrategies(intake) {
  const income = Number(intake.income || 0);
  return strategyCatalog
    .filter((s) => income >= s.minIncome)
    .filter((s) => s.fit.includes(intake.entityType))
    .filter((s) => !s.requiresHome || intake.homeOffice)
    .map((s) => ({
      ...s,
      score:
        (income >= s.minIncome ? 30 : 0) +
        (intake.entityType && s.fit.includes(intake.entityType) ? 30 : 0) +
        (intake.marginalRate === "37" || intake.marginalRate === "35" ? 20 : 10) +
        (intake.homeOffice && s.requiresHome ? 20 : !s.requiresHome ? 10 : 0),
    }))
    .sort((a, b) => b.score - a.score);
}

export default function TaxPlanningPortalPrototype() {
  const [tab, setTab] = useState("home");
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [intake, setIntake] = useState({
    firstName: "",
    lastName: "",
    email: "",
    maritalStatus: "",
    filingStatus: "",
    income: "",
    marginalRate: "",
    entityType: "",
    businessOrganized: "",
    homeOffice: false,
    hasChildren: false,
    usesVehicle: false,
    notes: "",
  });

  const recommendations = useMemo(() => scoreStrategies(intake), [intake]);
  const progress = useMemo(() => (step / 4) * 100, [step]);

  const update = (key, value) => setIntake((prev) => ({ ...prev, [key]: value }));

  const StrategyCard = ({ strategy, compact = false }) => (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{strategy.name}</CardTitle>
            <CardDescription>{strategy.summary}</CardDescription>
          </div>
          <Badge variant="secondary">{strategy.tag}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!compact && (
          <>
            <div className="text-sm text-muted-foreground">Fit score: {strategy.score}/100</div>
            <div className="flex flex-wrap gap-2">
              {strategy.docs.map((doc) => (
                <Badge key={doc} variant="outline">{doc}</Badge>
              ))}
            </div>
          </>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setTab("portal")}>View in portal</Button>
          <Button size="sm" variant="outline">Add to starter package</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-xl font-semibold tracking-tight">LedgersUSA PLLC</div>
            <div className="text-sm text-slate-500">DIY Tax Planning Portal Prototype</div>
          </div>
          <div className="hidden gap-2 md:flex">
            <Button variant={tab === "home" ? "default" : "outline"} onClick={() => setTab("home")}>Home</Button>
            <Button variant={tab === "intake" ? "default" : "outline"} onClick={() => setTab("intake")}>Intake Wizard</Button>
            <Button variant={tab === "portal" ? "default" : "outline"} onClick={() => setTab("portal")}>Client Portal</Button>
            <Button variant={tab === "admin" ? "default" : "outline"} onClick={() => setTab("admin")}>Admin View</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {tab === "home" && (
          <div className="space-y-10">
            <section className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardContent className="p-8">
                  <Badge className="mb-4 rounded-full">Public Website Experience</Badge>
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">A DIY tax planning portal that qualifies leads, recommends strategies, and converts them into paid implementation engagements.</h1>
                  <p className="mt-4 max-w-2xl text-base text-slate-600">
                    Clients pay an initial diagnostic fee, complete a guided intake, receive an initial strategy package, and can upgrade into a LedgersUSA-reviewed implementation plan with templates, calculators, and access to specialist providers.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button size="lg" className="rounded-2xl" onClick={() => setTab("intake")}>Start tax planning intake <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    <Button size="lg" variant="outline" className="rounded-2xl" onClick={() => setTab("portal")}>Preview client dashboard</Button>
                  </div>
                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {[
                      [Calculator, "Step 1", "Paid diagnostic intake"],
                      [ShieldCheck, "Step 2", "LedgersUSA review"],
                      [FolderKanban, "Step 3", "Implementation toolkit"],
                    ].map(([Icon, stepTitle, desc]) => (
                      <div key={stepTitle} className="rounded-2xl border p-4">
                        <Icon className="mb-3 h-5 w-5" />
                        <div className="font-medium">{stepTitle}</div>
                        <div className="text-sm text-slate-500">{desc}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle>Recommended site architecture</CardTitle>
                  <CardDescription>Public-facing funnel plus secure client workspace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {[
                    "Public homepage with pricing and FAQs",
                    "Paid diagnostic intake wizard",
                    "Initial strategy scoring engine",
                    "Checkout for planning fee upgrade",
                    "Client dashboard with resources and tasks",
                    "Expert directory for specialized implementation",
                    "Admin review queue for LedgersUSA PLLC",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl border p-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 md:grid-cols-4">
              {[
                ["$500", "Initial Diagnostic", "Paid intake + starter recommendations"],
                ["$2,500+", "Planning Upgrade", "LedgersUSA review and vetted plan"],
                ["Resource Hub", "DIY Tools", "Augusta, accountable plan, calculators"],
                ["Marketplace", "Experts", "Payroll, legal, bookkeeping, retirement"],
              ].map(([a, b, c]) => (
                <Card key={b} className="rounded-2xl shadow-sm">
                  <CardContent className="p-5">
                    <div className="text-2xl font-semibold">{a}</div>
                    <div className="mt-1 font-medium">{b}</div>
                    <div className="mt-2 text-sm text-slate-500">{c}</div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Example starter package output</h2>
                  <p className="text-slate-500">Based on the intake, the portal recommends strategies before full review.</p>
                </div>
                <Button variant="outline" onClick={() => setTab("intake")}>Run the wizard</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {strategyCatalog.slice(0, 3).map((s) => (
                  <StrategyCard key={s.id} strategy={{ ...s, score: 82 }} compact />
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "intake" && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Tax planning intake wizard</CardTitle>
                <CardDescription>Collect the minimum viable information needed for initial strategy scoring.</CardDescription>
                <Progress value={progress} className="mt-2" />
              </CardHeader>
              <CardContent className="space-y-6">
                {step === 1 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>First name</Label><Input value={intake.firstName} onChange={(e) => update("firstName", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Last name</Label><Input value={intake.lastName} onChange={(e) => update("lastName", e.target.value)} /></div>
                    <div className="space-y-2 md:col-span-2"><Label>Email</Label><Input value={intake.email} onChange={(e) => update("email", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Marital status</Label><Select onValueChange={(v) => update("maritalStatus", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="married">Married</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Tax filing status</Label><Select onValueChange={(v) => update("filingStatus", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="mfj">Married Filing Jointly</SelectItem><SelectItem value="hoh">Head of Household</SelectItem></SelectContent></Select></div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Approx. annual income</Label><Input placeholder="250000" value={intake.income} onChange={(e) => update("income", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Marginal tax rate</Label><Select onValueChange={(v) => update("marginalRate", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="24">24%</SelectItem><SelectItem value="32">32%</SelectItem><SelectItem value="35">35%</SelectItem><SelectItem value="37">37%</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Business type / organization</Label><Select onValueChange={(v) => update("entityType", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="single_owner">Sole proprietor</SelectItem><SelectItem value="llc_single">Single-member LLC</SelectItem><SelectItem value="llc_multi">Multi-member LLC</SelectItem><SelectItem value="s_corp">S-Corp</SelectItem><SelectItem value="llc_taxed_s">LLC taxed as S-Corp</SelectItem><SelectItem value="partnership">Partnership</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>How organized are your books?</Label><Select onValueChange={(v) => update("businessOrganized", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="high">Current and organized</SelectItem><SelectItem value="medium">Mostly current</SelectItem><SelectItem value="low">Needs cleanup</SelectItem></SelectContent></Select></div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    {[
                      ["homeOffice", "Do you use your home for business activity?"],
                      ["hasChildren", "Do you have children who could legitimately work in the business?"],
                      ["usesVehicle", "Do you use a vehicle for business?"],
                    ].map(([key, label]) => (
                      <div key={key} className="flex items-center gap-3 rounded-2xl border p-4">
                        <Checkbox checked={!!intake[key]} onCheckedChange={(v) => update(key, Boolean(v))} />
                        <Label>{label}</Label>
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea value={intake.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Anything unusual about your tax situation?" />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <Card className="rounded-2xl border-dashed">
                      <CardContent className="p-5 text-sm text-slate-600">
                        <div className="font-medium text-slate-900">Initial diagnostic fee</div>
                        Charge a fixed amount here, such as <strong>$500</strong>, to unlock the strategy scoring report and starter portal access.
                      </CardContent>
                    </Card>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border p-4">
                        <div className="font-medium">What the client gets now</div>
                        <ul className="mt-2 space-y-1 text-sm text-slate-500">
                          <li>Initial strategy recommendations</li>
                          <li>Estimated-fit package</li>
                          <li>Access to starter resources</li>
                        </ul>
                      </div>
                      <div className="rounded-2xl border p-4">
                        <div className="font-medium">What upgrade unlocks</div>
                        <ul className="mt-2 space-y-1 text-sm text-slate-500">
                          <li>LedgersUSA PLLC review</li>
                          <li>Vetted planning report</li>
                          <li>Implementation documents and calculators</li>
                        </ul>
                      </div>
                    </div>
                    <Button className="rounded-2xl" onClick={() => { setSubmitted(true); setTab("portal"); }}>Submit intake and pay diagnostic fee</Button>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>Back</Button>
                  <Button disabled={step === 4} onClick={() => setStep((s) => Math.min(4, s + 1))}>Next</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Live recommendation preview</CardTitle>
                <CardDescription>Strategies appear as the client fills in their information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.length ? recommendations.slice(0, 3).map((s) => <StrategyCard key={s.id} strategy={s} compact />) : (
                  <div className="rounded-2xl border border-dashed p-6 text-sm text-slate-500">Enter income, entity type, and tax details to preview recommended strategies.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "portal" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                [submitted ? "Submitted" : "Pending", "Diagnostic intake"],
                [engaged ? "Paid" : "$2,500 Plan Fee", "Upgrade to reviewed plan"],
                [reviewed ? "Complete" : "In review", "LedgersUSA review"],
                [recommendations.length || 0, "Strategies matched"],
              ].map(([a, b]) => (
                <Card key={b} className="rounded-2xl shadow-sm"><CardContent className="p-5"><div className="text-2xl font-semibold">{a}</div><div className="text-sm text-slate-500">{b}</div></CardContent></Card>
              ))}
            </div>

            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 rounded-2xl">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="strategies">Strategies</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="experts">Experts</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Your initial strategy package</CardTitle>
                      <CardDescription>Automatically generated based on intake; subject to LedgersUSA review after upgrade.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      {recommendations.length ? recommendations.map((s) => <StrategyCard key={s.id} strategy={s} compact />) : <div className="text-sm text-slate-500">Complete intake to see recommendations.</div>}
                    </CardContent>
                  </Card>
                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Upgrade to reviewed plan</CardTitle>
                      <CardDescription>LedgersUSA PLLC vets the package, refines assumptions, and delivers the implementation plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border p-4 text-sm text-slate-600">
                        Includes reviewed strategy memo, customized implementation roadmap, and access to templates and calculators.
                      </div>
                      <Button className="w-full rounded-2xl" onClick={() => { setEngaged(true); setReviewed(true); }}>Pay planning fee and start review</Button>
                      <Separator />
                      <div className="text-sm text-slate-500">Suggested next step: have the portal route the client into an engagement agreement and secure payment workflow.</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="strategies">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {strategyCatalog.map((s) => <StrategyCard key={s.id} strategy={{ ...s, score: recommendations.find((r) => r.id === s.id)?.score || 68 }} />)}
                </div>
              </TabsContent>

              <TabsContent value="resources">
                <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Implementation library</CardTitle>
                      <CardDescription>What a paying client unlocks after review.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {[
                          ["Augusta Rule", ["Board Resolution", "Market Rent Analyzer", "Rental Agreement", "Event Log"]],
                          ["Accountable Plan", ["Policy", "Board Resolution", "Reimbursement Form", "Home Office Calculator"]],
                          ["S-Corp", ["Salary Optimization Calculator", "Entity Checklist", "Implementation Memo"]],
                        ].map(([group, docs]) => (
                          <AccordionItem key={group} value={group}>
                            <AccordionTrigger>{group}</AccordionTrigger>
                            <AccordionContent>
                              <div className="flex flex-wrap gap-2">
                                {docs.map((d) => <Badge key={d} variant="outline">{d}</Badge>)}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                  <Card className="rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle>Portal content model</CardTitle>
                      <CardDescription>Recommended resource sections for the live website.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                      {[
                        [FileText, "Templates", "Board resolutions, agreements, checklists"],
                        [Calculator, "Calculators", "Tax savings, market rent, salary, retirement"],
                        [ShieldCheck, "Compliance", "Audit memos, substantiation requirements"],
                        [Briefcase, "Implementation", "Step-by-step instructions and workflows"],
                      ].map(([Icon, title, desc]) => (
                        <div key={title} className="rounded-2xl border p-4">
                          <Icon className="mb-3 h-5 w-5" />
                          <div className="font-medium">{title}</div>
                          <div className="text-sm text-slate-500">{desc}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="experts">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-full max-w-md">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input className="pl-9" placeholder="Search experts by specialty" />
                    </div>
                    <Button variant="outline">Filter</Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {experts.map((expert) => (
                      <Card key={expert.name} className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                          <Users className="mb-3 h-5 w-5" />
                          <div className="font-medium">{expert.name}</div>
                          <div className="mt-1 text-sm text-slate-500">{expert.category}</div>
                          <p className="mt-3 text-sm text-slate-600">{expert.description}</p>
                          <Button size="sm" className="mt-4 w-full">View provider</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks">
                <Card className="rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle>Suggested implementation workflow</CardTitle>
                    <CardDescription>Post-review task list the client can track in the portal.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "Sign engagement agreement and pay planning fee",
                      "Upload prior-year return and current financials",
                      "Review vetted strategy memo from LedgersUSA PLLC",
                      "Download implementation templates and calculators",
                      "Choose specialist providers if outside support is needed",
                      "Mark each strategy complete and upload substantiation documents",
                    ].map((task, i) => (
                      <div key={task} className="flex items-center gap-3 rounded-2xl border p-4">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-medium">{i + 1}</div>
                        <div className="text-sm">{task}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {tab === "admin" && (
          <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>LedgersUSA admin workflow</CardTitle>
                <CardDescription>Suggested internal review queue for the public portal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "New paid diagnostics enter review queue",
                  "Triage by entity type, income range, and readiness score",
                  "Assign CPA review and target turnaround time",
                  "Approve or revise initial package recommendations",
                  "Release vetted report and implementation library access",
                  "Track upgrade conversions and provider referrals",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border p-4 text-sm">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-sm">
              <CardHeader>
                <CardTitle>Recommended build phases</CardTitle>
                <CardDescription>Practical roadmap for a public launch.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-2xl border p-4">
                  <div className="font-medium">Phase 1 — MVP</div>
                  <div className="mt-1 text-slate-500">Homepage, diagnostic intake, payment collection, recommendation engine, manual CPA review.</div>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="font-medium">Phase 2 — Client workspace</div>
                  <div className="mt-1 text-slate-500">Secure dashboard, downloadable templates, calculators, task tracking, document uploads.</div>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="font-medium">Phase 3 — Expert marketplace</div>
                  <div className="mt-1 text-slate-500">Provider profiles, referral workflows, status tracking, service-category matching.</div>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="font-medium">Phase 4 — Automation</div>
                  <div className="mt-1 text-slate-500">Automated report generation, CRM sync, portal analytics, recurring planning renewals.</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
