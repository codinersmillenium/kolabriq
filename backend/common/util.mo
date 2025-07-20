import TypCommon "type";

module {
    public func tagsFromString(str : Text) : TypCommon.Tags {
        return switch(str) {
            case("frontend") { #frontend; };
            case("backend")  { #backend; };
            case("ui")       { #ui; };
            case(_)          { #bussines_analist; };
        };
    }
}