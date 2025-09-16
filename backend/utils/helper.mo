import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Nat8 "mo:base/Nat8";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Char "mo:base/Char";
import Nat32 "mo:base/Nat32";
import Int32 "mo:base/Int32";
import Principal "mo:base/Principal";
import Int "mo:base/Int";

import TypCommon "../common/type";

import UtlDate "date";
import UtlSha256 "sha256";

module {
    public func hasAnyTag(haystack : [TypCommon.Tags], needle : [TypCommon.Tags]) : Bool {
        for (h in Iter.fromArray(haystack)) {
            if (Array.find<TypCommon.Tags>(needle, func(n) = n == h) != null) {
                return true;
            };
        };
        return false;
    };

    public func natToBlob(n : Nat) : Blob {
        if (n == 0) {
            return Blob.fromArray([0]);
        };

        var x = n;
        let bytes = Buffer.Buffer<Nat8>(0);

        while (x > 0) {
            let byte = Nat8.fromIntWrap(x % 256);
            bytes.add(byte);
            x /= 256;
        };

        let arr = Array.reverse<Nat8>(Buffer.toArray(bytes));

        return Blob.fromArray(arr)
    };

    public func generateReferralCode(caller : Principal) : Text {
        let userText  = Principal.toText(caller);
        let timestamp = Int.toText(UtlDate.now());
        let hashed    = UtlSha256.sha256(userText # timestamp);
        let export    = Array.take(Text.toArray(hashed), 16);

        return Text.fromArray(export);
    };


    public func textToNat(t : Text) : Int {
        var n : Nat32 = 0;
        for (c in t.chars()) {
            if (Char.isDigit(c)) {
                let digit : Nat32 = Char.toNat32(c) - 48;
                n := n * 10 + digit;
            } else {
                return 0;
            };
        };
        
        return Int32.toInt(Int32.fromNat32(n));
    };

    public func natToInt(n : Nat) : Int {
        return Int32.toInt(Int32.fromNat32(Nat32.fromNat(n)));
    };
}