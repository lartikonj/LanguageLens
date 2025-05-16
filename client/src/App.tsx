
import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import ArticlePage from "@/pages/article-page";
import AuthPage from "@/pages/auth-page";
import CategoriesPage from "@/pages/categories-page";
import SubjectPage from "@/pages/subject-page";
import ProfilePage from "@/pages/profile-page";
import AboutPage from "@/pages/about-page";
import MainLayout from "@/components/layout/main-layout";

function App() {
  return (
    <>
      <MainLayout>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/categories" component={CategoriesPage} />
          <Route path="/categories/:categorySlug" component={SubjectPage} />
          <Route path="/subjects/:subjectSlug" component={SubjectPage} />
          <Route path="/articles/:articleSlug" component={ArticlePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </MainLayout>
      <Toaster />
    </>
  );
}

export default App;
