Pod::Spec.new do |s|
  s.name           = 'VolaLocation'
  s.version        = '1.0.0'
  s.summary        = 'Background location sharing for Volá! drivers'
  s.description    = 'Sends the driver location to the Volá! API, also while the app is in the background'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
