/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : Footer
 * Description : Public application footer.
 * -----------------------------------------------------------------------------
 */

import { Link } from "react-router-dom";

import { navigationItems } from "@/components/layout/Navigation/navigation.data";

export default function Footer() {
    return (
        <footer className="mt-12 border-t border-gray-200 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
                {/* Main Footer */}
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Brand */}
                    <div>
                        <Link
                            to="/"
                            className="inline-block text-xl font-bold text-green-700"
                        >
                            thenewstime.in
                        </Link>

                        <p className="mt-3 max-w-sm text-sm leading-6 text-gray-600">
                            தமிழின் நம்பகமான டிஜிட்டல் செய்தித் தளம்.
                            இந்தியா மற்றும் உலகச் செய்திகளை உடனுக்குடன்
                            அறிந்து கொள்ளுங்கள்.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">
                            முக்கியப் பிரிவுகள்
                        </h2>

                        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                            {navigationItems
                                .filter((item) => item.path !== "/")
                                .map((item) => (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        className="text-sm text-gray-600 transition hover:text-green-700"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                        </div>
                    </div>

                    {/* About */}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">
                            எங்களைப் பற்றி
                        </h2>

                        <p className="mt-4 text-sm leading-6 text-gray-600">
                            thenewstime.in — செய்திகளை விரைவாகவும்
                            தெளிவாகவும் வழங்கும் டிஜிட்டல் செய்தி
                            தளம்.
                        </p>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} thenewstime.in.
                        அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.
                    </p>

                    <p>time for news</p>
                </div>
            </div>
        </footer>
    );
}