import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Nat8 "mo:base/Nat8";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Random "mo:base/Random";
import Text "mo:base/Text";
import Char "mo:base/Char";
import Nat32 "mo:base/Nat32";
import Int32 "mo:base/Int32";

import TypCommon "../common/type";

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

    public func generateReferralCode() : async Text {
        let charsetText  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let charset      = Iter.toArray(Text.toIter(charsetText));
        let charsetSize  = charset.size();
        let randomBlob   = await Random.blob();
        var code         = "";

        for (byte in randomBlob.vals()) {
            let idx = Nat8.toNat(byte) % charsetSize;
            code   #= Text.fromChar(charset[idx]);
        };

        return "REF-#" # code;
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