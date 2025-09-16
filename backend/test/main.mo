import Debug "mo:base/Debug";
import Int "mo:base/Int";

import UtlDate "../utils/date";

persistent actor {
    public query func loginUser() : async () {
        Debug.print(Int.toText(UtlDate.now()));
        Debug.print(Int.toText(UtlDate.addDate(1)));
    };
}