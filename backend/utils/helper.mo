import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Nat8 "mo:base/Nat8";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Random "mo:base/Random";
import Text "mo:base/Text";

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

}