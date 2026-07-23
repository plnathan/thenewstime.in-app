import { useEffect, useState } from "react";

const TOKEN = "5e01e077600f5e";

type IpInfoLocation = {
    ip: string;
    country: string;
    countrycode: string;
    continent: string;
    city?: string;
    region?: string;
    loc?: string;
    postal?: string;
    timezone?: string;
    [key: string]: unknown;
};

export async function getUserLocation(): Promise<IpInfoLocation | null> {
    try {
        const response = await fetch(
            `https://api.ipinfo.io/lite/me?token=${TOKEN}`
        );
        // const response = await fetch(
        //     `https://ipinfo.io/json?token=${TOKEN}`
        // );
        // const data = await response.json();
        // console.log(data);
        if (!response.ok) {
            throw new Error("Failed to fetch location");
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

const FindLocation = () => {

    const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
    const [error, setError] = useState("");
    const [address, setAddress] = useState({city: "", state: "", country: "", postalCode: "" });
    const [ipInfoLocation, setIpInfoLocation] = useState<IpInfoLocation | null>(null);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                const { latitude, longitude } = position.coords;
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`)
                    .then((response) => response.json())
                    .then((data) => {
                        //const address = data.address;
                        // const districtName = address.suburb || address.city_district || address.county 
                        //                     || address.state_district || "District not found";
                        // setDistrict(districtName);
                        //const districtName = address.county || "District not found";
                        setAddress({
                            city : data.address.state_district || "District not found",
                            state: data.address.state || "State not found",
                            country: data.address.country || "Country not found",
                            postalCode: data.address.postcode || "Postal code not found"
                        });
                        // console.log("Address:", data.address);
                        // console.log("District1:", data.address.city, data.address.town, data.address.village, data.address.hamlet);
                    })
                    .catch((error) => {
                        console.error("Error fetching district:", error);
                        setAddress({ city: "City not found", state: "State not found", country: "Country not found", postalCode: "Postal code not found" });
                    });
            },
            (err) => {
                setError(err.message);
            }
        );
    };



    useEffect(() => {

        async function loadLocation() {
            const result = await getUserLocation();
            setIpInfoLocation(result);
        }
        // nominatim
        getLocation();
        // IPInfo Lite
        loadLocation();

    }, []);

    return (
        <div className="find-location">
            <div className="find-location__content">
                <h1 className="find-location__title">Find Your Location</h1>
                <h2>Nominatim</h2>

                {location && (
                    <div>
                        <p>Latitude/Longitude: {location.latitude.toFixed(6) + "," + location.longitude.toFixed(6)}</p>
                        {/* <p>Address1: {address.address1}</p>
                        <p>Address2: {address.address2}</p> */}
                        <p>City: {address.city}</p>
                        <p>State: {address.state}</p>
                        <p>Country: {address.country}</p>
                        <p>Postal Code: {address.postalCode}</p>
                    </div>
                )}
                {/* <div>Address: {address ? `${address.address1}, ${address.address2}, ${address.address3}, ${address.state}, ${address.country}, ${address.postalCode}` : "Address not found"}</div> */}
                {error && <p>{error}</p>}
                <br></br>
            </div>
            
            <h2>IPInfo Lite</h2>

            {ipInfoLocation && (
                <>
                    <p>Latitude/Longitude : {ipInfoLocation.loc}</p>
                    <p>City : {ipInfoLocation.city}</p>
                    <p>State : {ipInfoLocation.region}</p>
                    <p>Country : {ipInfoLocation.country}</p>
                    {/* <p>Country Code : {ipInfoLocation.countrycode}</p> */}
                    <p>Postal Code : {ipInfoLocation.postal}</p>
                    {/* <p>Timezone : {ipInfoLocation.timezone}</p>
                    <p>IP : {ipInfoLocation.ip}</p> */}
                </>
            )}
        </div>
    );
}

export default FindLocation;