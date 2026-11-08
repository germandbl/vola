import { spacing } from "@vola/shared";
import { Image } from "expo-image";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { ErrorMessage } from "@/components/ErrorMessage";
import { PasswordField } from "@/components/PasswordField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { useSignInForm } from "@/hooks/use-sign-in-form";

const LOGO_HEIGHT = 72;
const LOGO_ASPECT_RATIO = 1281 / 434;

export default function SignInScreen() {
  const form = useSignInForm();

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Image
            source={require("@/assets/images/logo-color.png")}
            accessibilityLabel="Volá!"
            contentFit="contain"
            style={styles.logo}
          />
          <View style={styles.heading}>
            <AppText variant="titulo2" style={styles.centeredText}>
              Inicia sesión
            </AppText>
            <AppText tone="tintaSuave" style={styles.centeredText}>
              Usá el email y la contraseña que te dio tu comercio o Volá!
            </AppText>
          </View>
          {form.formError && <ErrorMessage message={form.formError} />}
          <TextField
            label="Email"
            placeholder="Ej. oscar.mendoza@minegocio.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="username"
            value={form.fields.email}
            onChangeText={(value) => form.updateField("email", value)}
            error={form.fieldErrors.email}
          />
          <PasswordField
            label="Contraseña"
            placeholder="Tu contraseña"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            value={form.fields.password}
            onChangeText={(value) => form.updateField("password", value)}
            onSubmitEditing={form.submit}
            error={form.fieldErrors.password}
          />
          <PrimaryButton
            label={form.isPending ? "Entrando…" : "Iniciar sesión"}
            isLoading={form.isPending}
            onPress={form.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    gap: spacing[6],
    padding: spacing[4],
  },
  logo: { height: LOGO_HEIGHT, aspectRatio: LOGO_ASPECT_RATIO, alignSelf: "center" },
  heading: { gap: spacing[2] },
  centeredText: { textAlign: "center" },
});
