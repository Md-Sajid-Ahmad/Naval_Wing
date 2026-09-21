package com.example.bncc.util

object BanglaUtils {
    private val BN_DIGITS = charArrayOf('০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯')

    val RANKS = listOf("Cadet", "LCPL", "CPL", "SGT", "CUO")

    val RANK_BN = mapOf(
        "Cadet" to "ক্যাডেট",
        "LCPL" to "ল্যান্স কর্পোরাল",
        "CPL" to "কর্পোরাল",
        "SGT" to "সার্জেন্ট",
        "CUO" to "ক্যাডেট আন্ডার অফিসার"
    )

    val STATUS_BN = mapOf(
        "active" to "সক্রিয়",
        "inactive" to "নিষ্ক্রিয়",
        "passed_out" to "উত্তীর্ণ",
        "present" to "উপস্থিত",
        "absent" to "অনুপস্থিত",
        "late" to "দেরি",
        "excused" to "ছুটি"
    )

    /** Convert Latin digits inside any string or number to Bangla digits */
    fun bn(value: Any?): String {
        if (value == null) return ""
        val str = value.toString()
        val sb = java.lang.StringBuilder(str.length)
        for (ch in str) {
            if (ch in '0'..'9') {
                sb.append(BN_DIGITS[ch - '0'])
            } else {
                sb.append(ch)
            }
        }
        return sb.toString()
    }

    /** Pad a number to 2 digits and convert to Bangla */
    fun bn2(value: Int): String {
        val str = value.toString().padStart(2, '0')
        return bn(str)
    }

    fun getRankBangla(rank: String): String {
        return RANK_BN[rank] ?: rank
    }

    fun getStatusBangla(status: String): String {
        return STATUS_BN[status] ?: status
    }

    fun getInitial(name: String?): String {
        val trimmed = name?.trim() ?: ""
        return if (trimmed.isNotEmpty()) trimmed.substring(0, 1) else "?"
    }
}
