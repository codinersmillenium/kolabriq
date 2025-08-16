import Time "mo:base/Time";

module {
    public func now() : Int {
        let now      = Time.now();
        let dayStart = (now / 1_000_000_000) / 86400 * 86400;
        return dayStart;
    };
    
    public func addDate(days : Int) : Int {
        let daysInSeconds = days * 24 * 60 * 60;
        return now() + daysInSeconds;
    };

    public func oneMonth() : Int {
        return addDate(30);
    };

    public func oneYear() : Int {
        return addDate(365);
    };
};