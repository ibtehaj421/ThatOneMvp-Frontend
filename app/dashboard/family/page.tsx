"use client";

import { useState } from "react";
import { useAuth, FamilyMember } from "../../_components/providers/AuthProvider";
import { useLocale } from "../../_components/providers/LocaleProvider";
import { Button } from "../../_components/ui/Button";
import { Input } from "../../_components/ui/Input";

const MAX_MEMBERS = 5;

function MemberCard({
  member,
  isYou,
  onRemove,
  labels,
}: {
  member: FamilyMember;
  isYou: boolean;
  onRemove?: () => void;
  labels: {
    head: string;
    member: string;
    pending_invite: string;
    you: string;
    remove: string;
    cancel_invite: string;
  };
}) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-[#e7e5e4] p-4 flex items-center gap-4">
      {/* Avatar */}
      <div
        className={[
          "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm shrink-0",
          member.role === "head"
            ? "bg-accent text-white"
            : member.status === "pending"
            ? "bg-bg2 text-ink3 border-2 border-dashed border-ink3/30"
            : "bg-accent/10 text-accent",
        ].join(" ")}
      >
        {member.status === "pending" ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        ) : (
          initials
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-ink truncate">{member.name}</p>
          {isYou && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-ink2/10 text-ink2">
              {labels.you}
            </span>
          )}
        </div>
        <p className="text-xs text-ink3 truncate">{member.email}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={[
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              member.role === "head"
                ? "bg-accent/10 text-accent"
                : member.status === "pending"
                ? "bg-amber-50 text-amber-700 border border-amber-100"
                : "bg-green-50 text-green-700 border border-green-100",
            ].join(" ")}
          >
            {member.role === "head"
              ? labels.head
              : member.status === "pending"
              ? labels.pending_invite
              : labels.member}
          </span>
        </div>
      </div>

      {/* Remove button (not for head, not for self) */}
      {!isYou && member.role !== "head" && onRemove && (
        <button
          onClick={onRemove}
          className="shrink-0 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          {member.status === "pending" ? labels.cancel_invite : labels.remove}
        </button>
      )}
    </div>
  );
}

export default function FamilyPage() {
  const { user, inviteFamilyMember, removeFamilyMember } = useAuth();
  const { t } = useLocale();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const isFamilyHead = user?.accountType === "family-head";
  const members = user?.familyMembers ?? [];
  const usedSlots = members.length;
  const freeSlots = MAX_MEMBERS - usedSlots;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    if (!inviteEmail.trim()) return;
    setLoading(true);
    const result = await inviteFamilyMember(inviteEmail.trim());
    setLoading(false);
    if (result.ok) {
      setInviteSuccess(`Invite sent to ${inviteEmail.trim()}`);
      setInviteEmail("");
      setShowInvite(false);
    } else {
      setInviteError(result.error ?? "Failed to send invite.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      {/* ── Plan header ── */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-ink">{t.family.plan_info}</p>
            <p className="text-sm text-ink3">
              {usedSlots} / {MAX_MEMBERS} {t.family.slots_used}
            </p>
          </div>
        </div>

        {/* Slot bars */}
        <div className="flex gap-1.5">
          {Array.from({ length: MAX_MEMBERS }).map((_, i) => (
            <div
              key={i}
              className={[
                "h-2 w-8 rounded-full transition-colors",
                i < usedSlots ? "bg-accent" : "bg-bg2",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      {/* Not family head notice */}
      {!isFamilyHead && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-sm text-amber-800">{t.family.individual_note}</p>
          <Button variant="secondary" size="sm" className="mt-3">
            {t.family.upgrade}
          </Button>
        </div>
      )}

      {/* Success message */}
      {inviteSuccess && (
        <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 flex items-center gap-3">
          <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-800">{inviteSuccess}</p>
          <button onClick={() => setInviteSuccess("")} className="ml-auto text-green-500 hover:text-green-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Members section ── */}
      {isFamilyHead && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink2">
              Members ({usedSlots}/{MAX_MEMBERS})
            </p>
            {freeSlots > 0 && (
              <Button
                size="sm"
                variant={showInvite ? "secondary" : "primary"}
                onClick={() => { setShowInvite((v) => !v); setInviteError(""); }}
              >
                {showInvite ? "Cancel" : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    {t.family.invite}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Invite form */}
          {showInvite && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <form onSubmit={handleInvite} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label={t.family.invite}
                    type="email"
                    placeholder={t.family.invite_email}
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    error={inviteError}
                    required
                  />
                </div>
                <Button type="submit" loading={loading} className="shrink-0">
                  {t.family.send_invite}
                </Button>
              </form>
              <p className="text-xs text-ink3 mt-2">
                {freeSlots} slot{freeSlots !== 1 ? "s" : ""} remaining
              </p>
            </div>
          )}

          {/* Member cards */}
          <div className="space-y-3">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isYou={member.email === user?.email}
                onRemove={
                  member.role !== "head"
                    ? () => removeFamilyMember(member.id)
                    : undefined
                }
                labels={{
                  head: t.family.head,
                  member: t.family.member,
                  pending_invite: t.family.pending_invite,
                  you: t.family.you,
                  remove: t.family.remove,
                  cancel_invite: t.family.cancel_invite,
                }}
              />
            ))}

            {/* Empty slots */}
            {Array.from({ length: freeSlots }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="rounded-2xl border-2 border-dashed border-[#e7e5e4] p-4 flex items-center gap-4 text-ink3"
              >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#e7e5e4] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Empty slot</p>
                  <p className="text-xs text-ink3/60">Invite a family member to fill this slot</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
