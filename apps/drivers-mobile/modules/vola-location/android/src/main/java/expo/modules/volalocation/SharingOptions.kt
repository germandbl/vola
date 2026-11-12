package expo.modules.volalocation

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class SharingOptions : Record {
  @Field
  val apiUrl: String = ""

  @Field
  val token: String = ""

  @Field
  val intervalSeconds: Double = 30.0
}
