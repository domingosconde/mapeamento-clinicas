import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Mail, Globe, Clock, Star, MessageSquare, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";

export default function ClinicDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const clinicId = parseInt(id || "0");

  // Fetch clinic details
  const { data: clinic, isLoading: clinicLoading } = trpc.clinics.getById.useQuery(
    { id: clinicId },
    { enabled: clinicId > 0 }
  );

  // Fetch specialties
  const { data: specialties = [] } = trpc.clinics.getSpecialties.useQuery(
    { clinicId },
    { enabled: clinicId > 0 }
  );

  // Fetch ratings and comments
  const { data: clinicRatings = [] } = trpc.ratings.getByClinic.useQuery(
    { clinicId },
    { enabled: clinicId > 0 }
  );

  const { data: clinicComments = [] } = trpc.comments.getByClinic.useQuery(
    { clinicId },
    { enabled: clinicId > 0 }
  );

  // Mutations
  const createRating = trpc.ratings.create.useMutation();
  const createComment = trpc.comments.create.useMutation();

  const handleSubmitRating = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (rating === 0) {
      alert("Por favor, selecione uma classificação");
      return;
    }

    try {
      await createRating.mutateAsync({
        clinicId,
        score: rating,
      });
      setRating(0);
      alert("Avaliação enviada com sucesso!");
    } catch (error) {
      alert("Erro ao enviar avaliação");
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!comment.trim()) {
      alert("Por favor, escreva um comentário");
      return;
    }

    try {
      await createComment.mutateAsync({
        clinicId,
        text: comment,
      });
      setComment("");
      alert("Comentário enviado com sucesso!");
    } catch (error) {
      alert("Erro ao enviar comentário");
    }
  };

  if (clinicLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Clínica não encontrada</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  const averageRating = clinicRatings.length > 0
    ? clinicRatings.reduce((sum, r) => sum + r.score, 0) / clinicRatings.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">{clinic.name}</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            {clinic.photoUrl && (
              <div className="rounded-lg overflow-hidden shadow-lg h-96 bg-slate-200">
                <img
                  src={clinic.photoUrl}
                  alt={clinic.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            {clinic.description && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-3">Sobre</h2>
                <p className="text-slate-600 leading-relaxed">{clinic.description}</p>
              </Card>
            )}

            {/* Specialties */}
            {specialties.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Especialidades</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {specialties.map((spec: any) => (
                    <div key={spec.specialties.id} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-slate-900 font-medium">{spec.specialties.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Contact & Hours */}
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Informações</h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">{clinic.address}</p>
                    <p className="text-sm text-slate-600">
                      {clinic.city}, {clinic.state} {clinic.zipCode}
                    </p>
                  </div>
                </div>

                {clinic.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <a href={`tel:${clinic.phone}`} className="text-blue-600 hover:underline">
                      {clinic.phone}
                    </a>
                  </div>
                )}

                {clinic.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <a href={`mailto:${clinic.email}`} className="text-blue-600 hover:underline">
                      {clinic.email}
                    </a>
                  </div>
                )}

                {clinic.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <a
                      href={clinic.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {clinic.website}
                    </a>
                  </div>
                )}

                {clinic.openingHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">Horário de Funcionamento</p>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">
                        {clinic.openingHours}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Comments Section */}
            <Card className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comentários ({clinicComments.length})
              </h2>

              {/* Add Comment Form */}
              {isAuthenticated ? (
                <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                  <Textarea
                    placeholder="Deixe um comentário sobre sua experiência..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-24"
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={createComment.isPending}
                    className="w-full"
                  >
                    {createComment.isPending ? "Enviando..." : "Enviar Comentário"}
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-3">
                    Faça login para deixar um comentário
                  </p>
                  <Button asChild size="sm">
                    <a href={getLoginUrl()}>Entrar</a>
                  </Button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {clinicComments.length === 0 ? (
                  <p className="text-center text-slate-600 py-8">
                    Nenhum comentário ainda. Seja o primeiro a comentar!
                  </p>
                ) : (
                  clinicComments.map((c) => (
                    <div key={c.id} className="border-t border-slate-200 pt-4 first:border-t-0 first:pt-0">
                      <p className="font-medium text-slate-900">{c.text}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Card */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Avaliação</h3>

              {/* Average Rating */}
              {clinicRatings.length > 0 && (
                <div className="text-center py-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i: number) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {averageRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-slate-600">
                    ({clinicRatings.length} avaliação{clinicRatings.length !== 1 ? "ões" : ""})
                  </p>
                </div>
              )}

              {/* Rate Form */}
              {isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-900">Sua avaliação:</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={handleSubmitRating}
                    disabled={createRating.isPending || rating === 0}
                    className="w-full"
                  >
                    {createRating.isPending ? "Enviando..." : "Enviar Avaliação"}
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-3">
                    Faça login para avaliar
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <a href={getLoginUrl()}>Entrar</a>
                  </Button>
                </div>
              )}
            </Card>

            {/* Verification Badge */}
            {clinic.isVerified && (
              <Card className="p-4 bg-green-50 border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Clínica Verificada
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
