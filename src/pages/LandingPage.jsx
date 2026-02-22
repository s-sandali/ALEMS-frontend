import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import AlgorithmsSection from "../components/landing/AlgorithmsSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import StatsSection from "../components/landing/StatsSection";
import DashboardSection from "../components/landing/DashboardSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
    return (
        <>
            <Navbar />
            <HeroSection />
            <AlgorithmsSection />
            <FeaturesSection />
            <HowItWorksSection />
            <StatsSection />
            <DashboardSection />
            <CTASection />
            <Footer />
        </>
    );
}
