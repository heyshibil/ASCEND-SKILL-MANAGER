import React, { useEffect, useMemo, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Save,
  Send,
  Shield,
  UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "../store/useAuthStore";

const inputClass =
  "w-full h-9 border rounded-[var(--radius-md)] px-3 text-[14px] outline-none transition-all focus:border-[#2563EB] focus:ring-2 focus:ring-[rgba(37,99,235,0.15)]";

const sectionStyle = {
  background: "var(--bg-surface)",
  borderColor: "var(--border-subtle)",
};

const tabStyle = (isActive) => ({
  background: isActive ? "var(--bg-surface)" : "transparent",
  borderColor: isActive ? "var(--border-base)" : "transparent",
});

const fieldStyle = {
  background: "var(--bg-surface)",
  borderColor: "var(--border-base)",
  color: "var(--text-primary)",
};

const raisedFieldStyle = {
  background: "var(--bg-raised)",
  borderColor: "var(--border-subtle)",
  color: "var(--text-secondary)",
};

export default function Settings() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const requestEmailChange = useAuthStore((state) => state.requestEmailChange);
  const requestPasswordChange = useAuthStore(
    (state) => state.requestPasswordChange,
  );

  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    username: "",
    avatarUrl: "",
  });
  const [emailForm, setEmailForm] = useState({ email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPublicProfile, setIsPublicProfile] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isEmailSaving, setIsEmailSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      username: user.username || "",
      avatarUrl: user.avatarUrl || "",
    });
  }, [user]);

  const displayInitial = user?.username?.charAt(0).toUpperCase() || "U";
  const isManualAccount = user?.authProvider === "manual";

  const hasProfileChanged = useMemo(() => {
    if (!user) return false;

    return (
      profileForm.username.trim() !== (user.username || "") ||
      profileForm.avatarUrl.trim() !== (user.avatarUrl || "")
    );
  }, [profileForm, user]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setIsProfileSaving(true);

    try {
      await updateProfile({
        username: profileForm.username.trim(),
        avatarUrl: profileForm.avatarUrl.trim(),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    const nextEmail = emailForm.email.trim();

    if (!nextEmail) {
      toast.error("Enter a new email address");
      return;
    }

    if (nextEmail.toLowerCase() === user?.email?.toLowerCase()) {
      toast.error("This is already your account email");
      return;
    }

    setIsEmailSaving(true);

    try {
      await requestEmailChange(nextEmail);
      setEmailForm({ email: "" });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send verification email",
      );
    } finally {
      setIsEmailSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!isManualAccount) {
      toast.error("Password changes are only available for manual accounts");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsPasswordSaving(true);

    try {
      await requestPasswordChange({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send password verification email",
      );
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const renderButtonContent = (isLoading, icon, label) => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving
        </>
      );
    }

    return (
      <>
        {icon}
        {label}
      </>
    );
  };

  if (!user) {
    return (
      <div className="text-[var(--text-tertiary)] flex justify-center mt-20 animate-pulse-subtle text-[14px]">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div>
          <h1 className="text-[24px] font-medium text-[var(--text-primary)] tracking-[-0.01em]">
            Settings
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-[14px]">
            Manage your profile, login security, and account preferences.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 h-9 rounded-[var(--radius-md)] border" style={raisedFieldStyle}>
          <Shield className="w-4 h-4 text-[#34D399]" />
          <span className="text-[13px] font-medium">
            {user.isEmailVerified ? "Verified account" : "Email pending"}
          </span>
        </div>
      </div>

      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6"
      >
        <Tabs.List className="flex lg:flex-col gap-2 p-2 rounded-[var(--radius-lg)] border h-fit" style={sectionStyle}>
          <Tabs.Trigger
            value="profile"
            className={`flex items-center gap-2 px-3 h-10 rounded-[var(--radius-md)] border text-[14px] font-medium transition-colors ${
              activeTab === "profile"
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]"
            }`}
            style={tabStyle(activeTab === "profile")}
          >
            <UserCircle className="w-4 h-4" />
            Profile
          </Tabs.Trigger>
          <Tabs.Trigger
            value="account"
            className={`flex items-center gap-2 px-3 h-10 rounded-[var(--radius-md)] border text-[14px] font-medium transition-colors ${
              activeTab === "account"
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]"
            }`}
            style={tabStyle(activeTab === "account")}
          >
            <Lock className="w-4 h-4" />
            Account
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="profile" className="focus:outline-none">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <form
              onSubmit={handleProfileSubmit}
              className="xl:col-span-2 p-6 rounded-[var(--radius-lg)] border flex flex-col gap-6"
              style={sectionStyle}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-medium text-[var(--text-primary)]">
                    Profile
                  </h2>
                  <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                    Public identity shown across Ascend.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={!hasProfileChanged || isProfileSaving}
                  className="flex items-center gap-2 px-4 h-9 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[var(--text-disabled)] disabled:text-[var(--bg-canvas)] text-white rounded-[var(--radius-md)] font-medium text-[14px] transition-colors"
                >
                  {renderButtonContent(
                    isProfileSaving,
                    <Save className="w-4 h-4" />,
                    "Save",
                  )}
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-3 md:w-[160px]">
                  {profileForm.avatarUrl ? (
                    <img
                      src={profileForm.avatarUrl}
                      alt={profileForm.username || user.username}
                      className="w-24 h-24 rounded-full border object-cover"
                      style={{ borderColor: "var(--border-subtle)" }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[var(--accent)] flex items-center justify-center text-[28px] font-medium text-white">
                      {displayInitial}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)]">
                    <Camera className="w-3.5 h-3.5" />
                    Avatar
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          username: event.target.value,
                        }))
                      }
                      minLength={3}
                      maxLength={30}
                      required
                      className={inputClass}
                      style={fieldStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                      Profile image URL
                    </label>
                    <input
                      type="url"
                      value={profileForm.avatarUrl}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          avatarUrl: event.target.value,
                        }))
                      }
                      placeholder="https://..."
                      className={inputClass}
                      style={fieldStyle}
                    />
                  </div>
                </div>
              </div>
            </form>

            <form
              onSubmit={handleEmailSubmit}
              className="p-6 rounded-[var(--radius-lg)] border flex flex-col gap-5"
              style={sectionStyle}
            >
              <div>
                <h2 className="text-[18px] font-medium text-[var(--text-primary)]">
                  Email
                </h2>
                <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                  Verification required.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Current email
                </label>
                <div className="h-9 border rounded-[var(--radius-md)] px-3 flex items-center justify-between text-[14px]" style={raisedFieldStyle}>
                  <span className="text-[var(--text-primary)] truncate">
                    {user.email}
                  </span>
                  {user.isEmailVerified && (
                    <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  New email
                </label>
                <input
                  type="email"
                  value={emailForm.email}
                  onChange={(event) => setEmailForm({ email: event.target.value })}
                  className={inputClass}
                  style={fieldStyle}
                />
              </div>

              <button
                type="submit"
                disabled={isEmailSaving}
                className="mt-auto flex items-center justify-center gap-2 px-4 h-9 rounded-[var(--radius-md)] border text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] transition-colors text-[14px] font-medium"
                style={{ borderColor: "var(--border-base)" }}
              >
                {isEmailSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send verification
                  </>
                )}
              </button>
            </form>
          </div>
        </Tabs.Content>

        <Tabs.Content value="account" className="focus:outline-none">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <form
              onSubmit={handlePasswordSubmit}
              className="p-6 rounded-[var(--radius-lg)] border flex flex-col gap-5"
              style={sectionStyle}
            >
              <div>
                <h2 className="text-[18px] font-medium text-[var(--text-primary)]">
                  Password
                </h2>
                <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                  Email confirmation applies the update.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                    Current password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))
                    }
                    disabled={!isManualAccount}
                    className={inputClass}
                    style={isManualAccount ? fieldStyle : raisedFieldStyle}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                    New password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))
                    }
                    minLength={8}
                    disabled={!isManualAccount}
                    className={inputClass}
                    style={isManualAccount ? fieldStyle : raisedFieldStyle}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                    minLength={8}
                    disabled={!isManualAccount}
                    className={inputClass}
                    style={isManualAccount ? fieldStyle : raisedFieldStyle}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isManualAccount || isPasswordSaving}
                className="flex items-center justify-center gap-2 px-4 h-9 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[var(--text-disabled)] disabled:text-[var(--bg-canvas)] text-white rounded-[var(--radius-md)] font-medium text-[14px] transition-colors"
              >
                {isPasswordSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send verification
                  </>
                )}
              </button>
            </form>

            <section
              className="p-6 rounded-[var(--radius-lg)] border flex flex-col gap-5 h-fit"
              style={sectionStyle}
            >
              <div>
                <h2 className="text-[18px] font-medium text-[var(--text-primary)]">
                  Visibility
                </h2>
                <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                  UI preview only.
                </p>
              </div>

              <div className="p-1 rounded-[var(--radius-lg)] border grid grid-cols-2 gap-1" style={{ background: "var(--bg-raised)", borderColor: "var(--border-subtle)" }}>
                <button
                  type="button"
                  onClick={() => setIsPublicProfile(true)}
                  className={`flex items-center justify-center gap-2 h-9 rounded-[var(--radius-md)] text-[14px] font-medium transition-colors ${
                    isPublicProfile
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                  style={isPublicProfile ? { background: "var(--bg-surface)" } : {}}
                >
                  <Eye className="w-4 h-4" />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublicProfile(false)}
                  className={`flex items-center justify-center gap-2 h-9 rounded-[var(--radius-md)] text-[14px] font-medium transition-colors ${
                    !isPublicProfile
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                  style={!isPublicProfile ? { background: "var(--bg-surface)" } : {}}
                >
                  <EyeOff className="w-4 h-4" />
                  Private
                </button>
              </div>

              <div className="rounded-[var(--radius-md)] border px-3 py-3 flex items-center justify-between gap-4" style={raisedFieldStyle}>
                <div>
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">
                    Feature visibility
                  </p>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                    {isPublicProfile ? "Public" : "Private"}
                  </p>
                </div>
                {isPublicProfile ? (
                  <Eye className="w-4 h-4 text-[#2563EB]" />
                ) : (
                  <EyeOff className="w-4 h-4 text-[var(--text-tertiary)]" />
                )}
              </div>
            </section>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
