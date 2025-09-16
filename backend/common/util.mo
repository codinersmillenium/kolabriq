import TypCommon "type";

module {
    public let GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";
    
    public func tagsFromString(str : Text) : TypCommon.Tags {
        return switch(str) {
            case("frontend") { #frontend; };
            case("backend")  { #backend; };
            case("ui")       { #ui; };
            case(_)          { #bussines_analist; };
        };
    };

    public func getStrTag(tag : TypCommon.Tags) : Text {
        return switch(tag) {
            case(#frontend)         { "frontend"; };
            case(#backend)          { "backend"; };
            case(#ui)               { "ui"; };
            case(#bussines_analist) { "bussines_analist"; };
        };
    };
}