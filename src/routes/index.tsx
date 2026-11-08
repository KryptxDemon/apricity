import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MeanwhileProvider, useMeanwhile } from "../context/MeanwhileContext";
import { SceneryBackground } from "../components/meanwhile/SceneryBackground";
import { NavigationRail, type ActiveTab } from "../components/meanwhile/NavigationRail";
import { SharedHomeView } from "../components/meanwhile/SharedHomeView";
import { StudyNotebookView } from "../components/meanwhile/StudyNotebookView";
import { QuietRoomView } from "../components/meanwhile/QuietRoomView";
import { CollaborationHistoryView } from "../components/meanwhile/CollaborationHistoryView";
import { SettingsView } from "../components/meanwhile/SettingsView";
import { PokeModal } from "../components/meanwhile/PokeModal";
import { CollaborateModal } from "../components/meanwhile/CollaborateModal";
import { AuthModal } from "../components/meanwhile/AuthModal";

export const Route = createFileRoute("/")({
  component: ApricityApp,
});

function ApricityApp() {
  return (
    <MeanwhileProvider>
      <ApricityContent />
    </MeanwhileProvider>
  );
}

function ApricityContent() {
  const {
    currentUser,
    loginUser,
    theme,
    space,
    isHost,
    addCollaborator,
    kickCollaborator,
    renameSpace,
    setSpaceQuote,
    diminishSpace,
    joinSpaceByCode,
    collaborationHistory,
  } = useMeanwhile();

  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [isPokeModalOpen, setIsPokeModalOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

  const isDark = theme === "dark";

  // If user is not yet logged in, show the Auth Modal
  if (!currentUser) {
    return (
      <SceneryBackground scenery="rainy-window" theme={theme}>
        <AuthModal onLogin={loginUser} theme={theme} />
      </SceneryBackground>
    );
  }

  return (
    <SceneryBackground scenery={currentUser.scenery} theme={theme}>
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Navigation Rail / Sidebar (Fixed on desktop) */}
        <NavigationRail
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenPokeModal={() => setIsPokeModalOpen(true)}
          onOpenCollaborateModal={() => setIsCollabModalOpen(true)}
        />

        {/* Main Content Area (Offset by fixed sidebar on desktop) */}
        <main className="flex-1 w-full min-h-screen lg:pl-64 xl:pl-72 pb-16 lg:pb-12">
          {activeTab === "home" && (
            <SharedHomeView
              onOpenCollaborateModal={() => setIsCollabModalOpen(true)}
              onOpenPokeModal={() => setIsPokeModalOpen(true)}
            />
          )}

          {activeTab === "my-notebook" && <StudyNotebookView />}

          {activeTab === "history" && (
            <CollaborationHistoryView
              history={collaborationHistory}
              onOpenCollaborateModal={() => setIsCollabModalOpen(true)}
              isDark={isDark}
            />
          )}

          {activeTab === "quiet-room" && <QuietRoomView />}

          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Nudge Modal */}
      <PokeModal isOpen={isPokeModalOpen} onClose={() => setIsPokeModalOpen(false)} />

      {/* 10-Person Collaboration Modal with Leader Powers */}
      <CollaborateModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
        space={space}
        isHost={isHost}
        onAddCollaborator={addCollaborator}
        onKickCollaborator={kickCollaborator}
        onRenameSpace={renameSpace}
        onSetSpaceQuote={setSpaceQuote}
        onDiminishSpace={diminishSpace}
        onJoinSpaceByCode={joinSpaceByCode}
        isDark={isDark}
      />
    </SceneryBackground>
  );
}
