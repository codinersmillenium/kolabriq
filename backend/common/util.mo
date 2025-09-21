import TypCommon "type";

module {
    public let GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";
    
    public func tagsFromString(str : Text) : TypCommon.Tags {
        return switch(str) {
            case("frontend") { #frontend; };
            case("backend")  { #backend; };
            case("ui")       { #ui; };
            case(_)          { #business_analyst; };
        };
    };

    public func getStrTag(tag : TypCommon.Tags) : Text {
        return switch(tag) {
            case(#frontend)         { "frontend"; };
            case(#backend)          { "backend"; };
            case(#ui)               { "ui"; };
            case(#business_analyst) { "business_analyst"; };
        };
    };
}