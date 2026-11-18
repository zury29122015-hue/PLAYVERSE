import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { SettingsForm } from "@/components/profile/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sessionUser = await requireUser();
  const user = await db.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { name: true, bio: true, avatarUrl: true, username: true, email: true },
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold mb-6">Ajustes de cuenta</h1>
      <SettingsForm initial={user} />
    </div>
  );
}
