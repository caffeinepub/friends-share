import { Button } from "@/components/ui/button";
import { Heart, ImageIcon, Loader2, MessageCircle, Users } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  const features = [
    {
      icon: <ImageIcon className="w-5 h-5" />,
      label: "Share Photos",
      desc: "Share moments with your circle",
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: "Direct Messages",
      desc: "Chat privately with friends",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Friends Network",
      desc: "Build your personal network",
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: "Like & Comment",
      desc: "Engage with your friends' posts",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "oklch(0.96 0.004 265)" }}
      data-ocid="login.page"
    >
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: "oklch(0.80 0.12 185)" }}
            >
              FS
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Friends
                <span style={{ color: "oklch(0.80 0.12 185)" }}>Share</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Connect. Share. Stay close.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl p-4 border border-border card-shadow"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-white"
                  style={{ backgroundColor: "oklch(0.80 0.12 185)" }}
                >
                  {f.icon}
                </div>
                <p className="font-semibold text-sm text-foreground">
                  {f.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Login card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-8 card-shadow"
          data-ocid="login.card"
        >
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to reconnect with your friends
            </p>
          </div>

          <Button
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="w-full h-12 text-base font-semibold"
            data-ocid="login.primary_button"
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Connecting...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Secure, decentralized identity — no passwords needed
          </p>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              New to FriendsShare? Sign in to create your account automatically.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
