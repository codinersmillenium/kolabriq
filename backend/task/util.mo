import TypTask "type";

module {
    public func translateOverviewError(error : TypTask.OverviewError) : Text {
        switch(error) {
            case(#notFound) { return "Task tidak ditemukan" };
            case(#notDone)  { return "Task belum selesai" };
            case(_)         { return "Terjadi kesalahan, mohon coba beberapa waktu kembali" };
        };
    }
}