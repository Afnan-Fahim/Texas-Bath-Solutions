import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminPanel() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchQuizData();
      else setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchQuizData();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchQuizData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quiz_settings")
      .select("quiz_data")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Error fetching quiz data:", error);
    } else {
      setQuizData(data.quiz_data);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(`Login Error: ${error.message}`);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(`Sign Up Error: ${error.message}`);
    } else {
      if (data.session) {
        alert("Account created and logged in successfully!");
      } else {
        alert("Account created! Please check your email inbox to verify your email, then come back here to log in.");
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const uploadImage = async (file: File, questionKey: string, optionIndex: number) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `quiz/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('quiz-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('quiz-assets').getPublicUrl(filePath);
      
      // Update local state
      const newData = { ...quizData };
      newData[questionKey].options[optionIndex].image = data.publicUrl;
      setQuizData(newData);

      // Save to database
      await saveQuizData(newData);
    } catch (error: any) {
      alert(`Error uploading image: ${error.message}`);
    }
  };

  const saveQuizData = async (data: any) => {
    const { error } = await supabase
      .from("quiz_settings")
      .update({ quiz_data: data })
      .eq("id", 1);

    if (error) {
      alert(`Error saving data: ${error.message}`);
    } else {
      alert("Saved successfully!");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-card border rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Admin Login / Sign Up</h2>
        <p className="text-xs text-muted-foreground mb-6">Connected to: {import.meta.env.VITE_SUPABASE_URL}</p>
        <form className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="flex gap-4 pt-2">
            <Button type="submit" onClick={handleLogin} className="w-full">Log In</Button>
            <Button type="submit" onClick={handleSignUp} variant="outline" className="w-full">Create Account</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-card border rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quiz Admin Panel</h1>
        <Button variant="outline" onClick={handleLogout}>Log Out</Button>
      </div>

      {!quizData ? (
        <div>No quiz data found. Please ensure you ran the SQL setup script in Supabase!</div>
      ) : (
        <div className="space-y-12">
          {Object.entries(quizData).map(([qKey, question]: [string, any]) => (
            <div key={qKey} className="border p-6 rounded-lg bg-muted/20">
              <h2 className="text-xl font-bold mb-2">{question.title}</h2>
              <p className="text-muted-foreground mb-4">{question.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {question.options.map((opt: any, index: number) => (
                  <div key={opt.id} className="p-4 border rounded bg-background flex flex-col items-center">
                    <h3 className="font-semibold mb-2">{opt.label}</h3>
                    {opt.image ? (
                      <img src={opt.image} alt={opt.label} className="w-full h-32 object-cover mb-4 rounded" />
                    ) : (
                      <div className="w-full h-32 bg-muted flex items-center justify-center mb-4 rounded text-sm text-muted-foreground">
                        No image
                      </div>
                    )}
                    <div className="w-full relative">
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            uploadImage(e.target.files[0], qKey, index);
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
