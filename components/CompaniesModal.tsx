'use client';

import React, { useEffect, useState } from 'react';
import type {
  Company, DecisionSignal, DiscoveryCandidate, PaginatedCompanies, TeamMember,
} from '@/lib/types';
import { api } from '@/lib/api';
import { useLang } from '@/contexts/LangContext';
import type { Translations } from '@/contexts/LangContext';
import CompanyDetailPanel from './CompanyDetailPanel';

interface Props {
  batchId: string | null;
  batchName: string;
  isPersonaSearch: boolean;
  onClose: () => void;
}

// The review tab sits between the two existing ones: results the pipeline is sure
// about, then the ones it is not, then everything it looked at.
type Tab = 'results' | 'review' | 'candidates';

/**
 * Reason codes and stages are stable machine strings from the API, mapped to
 * translated labels here. An unknown code falls back to the raw string rather
 * than rendering blank — a new code on the API stays readable until translated.
 */
function labelFor(t: Translations, prefix: 'reason' | 'stage', code: string | null | undefined): string {
  if (!code) return '—';
  const value = (t as unknown as Record<string, unknown>)[`${prefix}_${code}`];
  return typeof value === 'string' ? value : code;
}

function effectIcon(effect: DecisionSignal['effect']): { icon: string; className: string } {
  switch (effect) {
    case 'ACCEPT': return { icon: 'check_circle', className: 'text-primary' };
    case 'REVIEW': return { icon: 'help',         className: 'text-amber-400' };
    default:       return { icon: 'cancel',       className: 'text-error' };
  }
}

export default function CompaniesModal({ batchId, batchName, isPersonaSearch, onClose }: Props) {
  const { t } = useLang();

  // Results tab state
  const [data, setData] = useState<PaginatedCompanies | null>(null);
  const [page, setPage] = useState(1);
  const [loadingResults, setLoadingResults] = useState(false);
  const [errorResults, setErrorResults] = useState('');

  // Candidates tab state
  const [candidates, setCandidates] = useState<DiscoveryCandidate[] | null>(null);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [errorCandidates, setErrorCandidates] = useState('');
  const [updatingDomain, setUpdatingDomain] = useState<string | null>(null);
  /** Domains whose decision criteria are expanded. */
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<Tab>('results');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (!batchId) return;
    setPage(1);
    setData(null);
    setCandidates(null);
    fetchPage(batchId, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  useEffect(() => {
    if ((activeTab === 'candidates' || activeTab === 'review') && batchId && candidates === null) {
      fetchCandidates(batchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function fetchPage(id: string, p: number) {
    setLoadingResults(true);
    setErrorResults('');
    try {
      const res = await api.getCompanies(id, p);
      setData(res);
      setPage(p);
    } catch (err: unknown) {
      setErrorResults(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingResults(false);
    }
  }

  async function fetchCandidates(id: string) {
    setLoadingCandidates(true);
    setErrorCandidates('');
    try {
      const res = await api.getCandidates(id);
      setCandidates(res);
    } catch (err: unknown) {
      setErrorCandidates(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingCandidates(false);
    }
  }

  async function handleCandidateAction(domain: string, action: 'exclude' | 'include' | 'reject') {
    if (!batchId) return;
    setUpdatingDomain(domain);
    try {
      await api.updateCandidate(batchId, domain, action);
      // Refresh all tabs — an action in one changes what the others show.
      await Promise.all([
        fetchCandidates(batchId),
        fetchPage(batchId, page),
      ]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdatingDomain(null);
    }
  }

  function toggleExpanded(domain: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }

  function crawlStatusBadge(s: string) {
    const map: Record<string, string> = {
      COMPLETED: 'text-primary',
      FAILED:    'text-error',
      CRAWLING:  'text-secondary',
      PENDING:   'text-on-surface-variant',
      BLOCKED:   'text-amber-400',
    };
    return map[s] || 'text-on-surface-variant';
  }

  function crawlStatusLabel(s: string) {
    if (s === 'BLOCKED') return 'Bot protected';
    return s;
  }

  function candidateStatusStyle(s: DiscoveryCandidate['status']): string {
    const map: Record<DiscoveryCandidate['status'], string> = {
      KEPT:     'bg-primary/10 text-primary',
      REVIEW:   'bg-amber-400/10 text-amber-400',
      FILTERED: 'bg-secondary/10 text-secondary',
      BLOCKED:  'bg-surface-container-highest text-on-surface-variant',
      EXCLUDED: 'bg-error/10 text-error',
    };
    return map[s];
  }

  function candidateStatusLabel(s: DiscoveryCandidate['status']): string {
    const map: Record<DiscoveryCandidate['status'], string> = {
      KEPT:     t.candidateKept,
      REVIEW:   t.candidateReview,
      FILTERED: t.candidateFiltered,
      BLOCKED:  t.candidateBlocked,
      EXCLUDED: t.candidateExcluded,
    };
    return map[s];
  }

  function renderTeam(team: TeamMember[]) {
    if (!team.length) return <span className="text-on-surface-variant">—</span>;
    const first = team[0];
    const displayName = first.name || first.position || first.email || '—';
    return (
      <div className="text-xs">
        <span className="font-medium text-white">{displayName}</span>
        {first.name && first.position && (
          <span className="text-on-surface-variant"> — {first.position}</span>
        )}
        {team.length > 1 && (
          <span className="text-on-surface-variant"> +{team.length - 1}</span>
        )}
      </div>
    );
  }

  function renderCompany(c: Company) {
    const profile = c.profile;
    const score = profile ? Math.round(profile.completionScore) : 0;
    const name = profile?.name || c.name || '—';
    const emails: string[] = Array.isArray(profile?.emails) ? profile!.emails : [];
    const team: TeamMember[] = Array.isArray(profile?.team) ? (profile!.team as TeamMember[]) : [];
    const personalized = c.personalizedContents?.[0];
    const personalizedPreview =
      personalized?.openingLine || personalized?.fullMessage || '';

    return (
      <tr
        key={c.id}
        className="hover:bg-surface-container-high/50 transition-colors cursor-pointer"
        onClick={() => setSelectedCompany(c)}
      >
        <td className="px-6 py-4">
          <a
            href={`https://${c.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-secondary font-medium text-sm transition-colors"
          >
            {c.domain}
          </a>
        </td>
        <td className="px-6 py-4">
          <div
            className="space-y-0.5"
            title={profile?.history || undefined}
          >
            <div className="text-sm text-white font-medium">{name}</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {profile?.industry && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium leading-none">
                  {profile.industry}
                </span>
              )}
              {profile?.foundingYear && (
                <span className="text-[11px] text-on-surface-variant leading-none">
                  Est. {profile.foundingYear}
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-0.5">
            <span className={`text-xs font-bold uppercase tracking-wide ${crawlStatusBadge(c.crawlStatus)}`}>
              {crawlStatusLabel(c.crawlStatus)}
            </span>
            {c.crawlStatus === 'BLOCKED' && (
              <div className="flex items-center gap-1 text-[10px] text-amber-400/70">
                <span className="material-symbols-outlined text-[11px]">shield</span>
                Human verification
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs text-on-surface-variant">{score}%</span>
          </div>
        </td>
        <td className="px-6 py-4 text-xs text-on-surface-variant">
          {emails.slice(0, 2).join(', ') || '—'}
        </td>
        <td className="px-6 py-4">{renderTeam(team)}</td>
        <td className="px-6 py-4 text-xs text-on-surface-variant max-w-[220px] truncate" title={personalizedPreview}>
          {personalizedPreview || '—'}
        </td>
        {isPersonaSearch && (
          <td className="px-6 py-4">
            <button
              onClick={() => handleCandidateAction(c.domain, 'exclude')}
              disabled={updatingDomain === c.domain}
              className="text-xs px-2 py-1 rounded border border-error/30 text-error hover:bg-error/10 transition-all disabled:opacity-40"
            >
              {updatingDomain === c.domain ? '…' : t.excludeBtn}
            </button>
          </td>
        )}
      </tr>
    );
  }

  function renderCandidates() {
    if (loadingCandidates) {
      return (
        <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant text-sm">
          <span className="spinner" />
          <span>{t.loading}</span>
        </div>
      );
    }
    if (errorCandidates) {
      return (
        <div className="m-8 px-4 py-3 bg-error-container/30 border border-error/20 rounded text-error text-sm">
          {errorCandidates}
        </div>
      );
    }
    if (!candidates || candidates.length === 0) {
      return (
        <div className="flex flex-col items-center gap-4 py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl opacity-30">filter_list</span>
          <p className="text-sm text-center max-w-sm">{t.noCandidates}</p>
        </div>
      );
    }

    const counts = candidates.reduce(
      (acc, c) => { acc[c.status] = (acc[c.status] ?? 0) + 1; return acc; },
      {} as Record<string, number>,
    );

    return (
      <div className="overflow-x-auto">
        {/* Summary pills */}
        <div className="flex gap-2 px-6 py-3 border-b border-outline-variant/10 flex-wrap">
          {(['KEPT', 'REVIEW', 'FILTERED', 'BLOCKED', 'EXCLUDED'] as const).map((s) =>
            counts[s] ? (
              <span key={s} className={`text-xs px-2.5 py-1 rounded-full font-medium ${candidateStatusStyle(s)}`}>
                {candidateStatusLabel(s)} · {counts[s]}
              </span>
            ) : null,
          )}
        </div>
        {renderCandidateTable(candidates)}
      </div>
    );
  }

  /** The review tab: only the candidates the pipeline was not confident about. */
  function renderReview() {
    if (loadingCandidates) {
      return (
        <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant text-sm">
          <span className="spinner" />
          <span>{t.loading}</span>
        </div>
      );
    }
    if (errorCandidates) {
      return (
        <div className="m-8 px-4 py-3 bg-error-container/30 border border-error/20 rounded text-error text-sm">
          {errorCandidates}
        </div>
      );
    }

    const forReview = (candidates ?? []).filter((c) => c.status === 'REVIEW');

    // An empty review list is the good outcome, not a missing-data state.
    if (forReview.length === 0) {
      return (
        <div className="flex flex-col items-center gap-4 py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl opacity-30 text-primary">task_alt</span>
          <p className="text-sm text-center max-w-sm">{t.noReviewNeeded}</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <p className="px-6 py-3 text-xs text-on-surface-variant border-b border-outline-variant/10">
          {t.reviewIntro}
        </p>
        {renderCandidateTable(forReview)}
      </div>
    );
  }

  /** Shared by both tabs: domain, title, reason, status, actions — plus expandable criteria. */
  function renderCandidateTable(rows: DiscoveryCandidate[]) {
    return (
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-highest/30 border-b border-outline-variant/10">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t.domain}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t.candidateTitle}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t.reasonColumn}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t.status}</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/5">
          {rows.map((c) => {
            const signals   = c.decisionSignals ?? [];
            const isOpen    = expanded.has(c.domain);
            const isBusy    = updatingDomain === c.domain;
            // The headline evidence is the signal that matches the stored verdict.
            const primary   = signals.find((s) => s.criterion === c.rejectedReason) ?? signals[0];

            return (
              <React.Fragment key={c.id}>
                <tr className="hover:bg-surface-container-high/50 transition-colors">
                  <td className="px-6 py-4">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-secondary font-medium text-sm transition-colors"
                    >
                      {c.domain}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant max-w-xs truncate">
                    {c.title || '—'}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <button
                      onClick={() => toggleExpanded(c.domain)}
                      className="flex items-start gap-1 text-left group"
                      aria-expanded={isOpen}
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] mt-0.5 text-on-surface-variant transition-transform ${isOpen ? 'rotate-90' : ''}`}
                      >
                        chevron_right
                      </span>
                      <span>
                        <span className="block text-xs text-on-surface group-hover:text-primary transition-colors">
                          {labelFor(t, 'reason', c.rejectedReason)}
                        </span>
                        {primary?.detail && (
                          <span className="block text-[11px] text-on-surface-variant line-clamp-2">
                            {primary.detail}
                          </span>
                        )}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${candidateStatusStyle(c.status)}`}>
                      {candidateStatusLabel(c.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {c.status === 'KEPT' && (
                        <button
                          onClick={() => handleCandidateAction(c.domain, 'exclude')}
                          disabled={isBusy}
                          className="text-xs px-2 py-1 rounded border border-error/30 text-error hover:bg-error/10 transition-all disabled:opacity-40"
                        >
                          {isBusy ? '…' : t.excludeBtn}
                        </button>
                      )}
                      {c.status !== 'KEPT' && (
                        <button
                          onClick={() => handleCandidateAction(c.domain, 'include')}
                          disabled={isBusy}
                          className="text-xs px-2 py-1 rounded border border-primary/30 text-primary hover:bg-primary/10 transition-all disabled:opacity-40"
                        >
                          {isBusy ? '…' : t.includeBtn}
                        </button>
                      )}
                      {c.status === 'REVIEW' && (
                        <button
                          onClick={() => handleCandidateAction(c.domain, 'reject')}
                          disabled={isBusy}
                          className="text-xs px-2 py-1 rounded border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-highest transition-all disabled:opacity-40"
                        >
                          {isBusy ? '…' : t.rejectBtn}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {isOpen && (
                  <tr className="bg-surface-container-high/30">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                          {t.criteriaHeading}
                        </span>
                        {typeof c.confidence === 'number' && (
                          <span className="text-xs text-on-surface-variant">
                            {t.confidenceLabel}: {c.confidence}
                          </span>
                        )}
                      </div>
                      {signals.length === 0 ? (
                        <p className="text-xs text-on-surface-variant">{t.noCriteria}</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {signals.map((s, i) => {
                            const { icon, className } = effectIcon(s.effect);
                            return (
                              <li key={i} className="flex items-start gap-2 text-xs">
                                <span className={`material-symbols-outlined text-[16px] ${className}`}>
                                  {icon}
                                </span>
                                <span className="text-on-surface-variant w-32 flex-shrink-0">
                                  {labelFor(t, 'stage', s.stage)}
                                </span>
                                <span className="text-on-surface flex-shrink-0 w-56">
                                  {labelFor(t, 'reason', s.criterion)}
                                </span>
                                {s.detail && (
                                  <span className="text-on-surface-variant">{s.detail}</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (!batchId) return null;

  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  return (
    <>
    <div
      className="fixed inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4 md:p-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-white font-headline font-bold text-lg">{batchName}</h2>
            {data && (
              <p className="text-on-surface-variant text-xs mt-0.5">
                {pagination?.total ?? 0} companies found
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs — only shown for persona search batches */}
        {isPersonaSearch && (
          <div className="flex border-b border-outline-variant/10 px-8 flex-shrink-0">
            {(['results', 'review', 'candidates'] as Tab[]).map((tab) => {
              const label =
                tab === 'results' ? t.resultsTab
              : tab === 'review'  ? t.reviewTab
              :                     t.candidatesTab;
              // Only the review tab carries a count — it is the one that asks the
              // user to do something, so the number is the call to action.
              const pending = tab === 'review'
                ? (candidates ?? []).filter((c) => c.status === 'REVIEW').length
                : 0;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-white'
                  }`}
                >
                  {label}
                  {pending > 0 && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-medium">
                      {pending}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Modal body */}
        <div className="overflow-y-auto flex-1">
          {activeTab === 'results' && (
            <>
              {loadingResults && (
                <div className="flex items-center justify-center py-20 gap-3 text-on-surface-variant text-sm">
                  <span className="spinner" />
                  <span>Loading companies…</span>
                </div>
              )}
              {errorResults && (
                <div className="m-8 px-4 py-3 bg-error-container/30 border border-error/20 rounded text-error text-sm">
                  {errorResults}
                </div>
              )}
              {!loadingResults && !errorResults && data && (
                <>
                  {data.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-20 text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl opacity-30">domain</span>
                      <p className="text-sm">{t.noCompanies}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-highest/30 border-b border-outline-variant/10">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{t.domain}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{t.name}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{t.status}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{t.score}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{t.emails}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{t.team}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{t.personalized}</th>
                            {isPersonaSearch && (
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{t.actions}</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/5">
                          {data.data.map(renderCompany)}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeTab === 'review' && renderReview()}
          {activeTab === 'candidates' && renderCandidates()}
        </div>

        {/* Pagination footer — only on results tab */}
        {activeTab === 'results' && !loadingResults && !errorResults && totalPages > 1 && (
          <div className="px-8 py-5 border-t border-outline-variant/10 flex justify-between items-center text-xs text-on-surface-variant font-medium flex-shrink-0">
            <span>
              {t.showing}{' '}
              {(page - 1) * (pagination?.limit ?? 50) + 1}–
              {Math.min(page * (pagination?.limit ?? 50), pagination?.total ?? 0)}{' '}
              {t.of} {pagination?.total}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <button
                  onClick={() => { if (batchId) fetchPage(batchId, page - 1); }}
                  className="px-3 py-1.5 border border-outline-variant/20 rounded hover:bg-surface-container-high transition-all hover:text-white"
                >
                  {t.prev}
                </button>
              )}
              {page < totalPages && (
                <button
                  onClick={() => { if (batchId) fetchPage(batchId, page + 1); }}
                  className="px-3 py-1.5 border border-outline-variant/20 rounded hover:bg-surface-container-high transition-all hover:text-white"
                >
                  {t.next}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {selectedCompany && (
      <CompanyDetailPanel
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />
    )}
    </>
  );
}
