import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { getDefaultRouteByRole } from "../utils/auth.js";

export default function GoogleButton() {
  const navigate = useNavigate();

  return (
    <GoogleLogin
      onSuccess={async (res) => {
        try {
          const credential = res?.credential;

          if (!credential) {
            toast.error("Failed to get Google credentials");
            return;
          }

          // Use the same endpoint that returns user + role as your LoginPage
          const { data } = await api.post("/auth/google/login", { credential });

          // Save everything your ProtectedRoute / app relies on
          localStorage.setItem("token", data.token);
          if (data?.user?.role) localStorage.setItem("role", data.user.role);
          if (data?.user?.name) localStorage.setItem("name", data.user.name);
          if (data?.user?.churchName) localStorage.setItem("churchName", data.user.churchName);
          if (data?.user?.email) localStorage.setItem("prefillEmail", data.user.email);
          if (data?.user?.username) localStorage.setItem("username", data.user.username);
          if (data?.user?.avatar) localStorage.setItem("avatar", data.user.avatar);
          if (data?.user?.churchName) {
            localStorage.setItem("churchName", data.user.churchName);
            window.dispatchEvent(new CustomEvent("churchName:update", { detail: data.user.churchName }));
          } else if (data?.user?.role === "church-admin") {
            try {
              const resp = await api.get("/church-admin/me/church", {
                headers: { Authorization: `Bearer ${data.token}` },
              });
              const name = resp?.data?.church?.name;
              if (name) {
                localStorage.setItem("churchName", name);
                window.dispatchEvent(new CustomEvent("churchName:update", { detail: name }));
              }
            } catch {}
          }

          // Store minimal user data for SkillMatch app compatibility
          const minimalUserData = {
            _id: data.user._id || data.user.id,
            id: data.user.id || data.user._id,
            firstName: data.user.firstName || data.user.name?.split(" ")[0] || "",
            lastName: data.user.lastName || data.user.name?.split(" ").slice(1).join(" ") || "",
            email: data.user.email,
            profilePicture: data.user.avatar || data.user.profilePicture,
            course: data.user.course,
            yearLevel: data.user.yearLevel,
            userType: data.user.userType || data.user.role || "student"
          };
          
          try {
            localStorage.setItem('user', JSON.stringify(minimalUserData));
          } catch (storageError) {
            console.error('Failed to store user data:', storageError);
            localStorage.setItem('user', JSON.stringify({ _id: data.user._id, email: data.user.email }));
          }

          window.dispatchEvent(new Event("auth:update"));

          if (data.needsPassword) {
            toast.message("Almost done — create a password for email login.");
            navigate("/create-password", { replace: true });
            return;
          }

          toast.success("Signed in with Google");
          // Check for saved page first, otherwise use default route
          const savedPage = localStorage.getItem('userActivePage');
          let dest;
          if (savedPage && savedPage !== '/login' && savedPage !== '/signup' && savedPage !== '/') {
            dest = savedPage;
          } else {
            dest = getDefaultRouteByRole(data?.user?.role || data?.user?.userType || "student");
          }
          navigate(dest, { replace: true });
        } catch (e) {
          const status = e?.response?.status;
          const code = e?.response?.data?.code;
          const msg = e?.response?.data?.message;

          if (status === 403 && code === "UNDER_REVIEW") {
            toast.info("Your church admin application is under review. We'll email you once it's approved.");
            return;
          }
          
          // Check if account is archived
          if (status === 403 && e?.response?.data?.isArchived) {
            if (e?.response?.data?.archivedAt) {
              localStorage.setItem('archivedInfo', JSON.stringify({ archivedAt: e.response.data.archivedAt }));
            }
            navigate('/archived-account');
            return;
          }
          
          toast.error(msg || "Google sign-in failed");
        }
      }}
      onError={() => toast.error("Google sign-in cancelled")}
      ux_mode="popup"
      text="continue_with"
      shape="pill"
      size="large"
      width="100%"
    />
  );
}

